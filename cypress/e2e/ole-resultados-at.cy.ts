/// <reference types="cypress" />

/**
 * E2E: Open Olé, dismiss popups, open Olé Resultados, then Liga Profesional
 * standings, and open Atlético Tucumán results.
 *
 * Third-party video ads (Connatix and similar) keep the window load event
 * from firing, so those hosts are stubbed before each visit.
 */

const OLE_URL = 'https://www.ole.com.ar/';
const OLE_RESULTADOS_URL = 'https://www.ole.com.ar/estadisticas/futbol/home.html';

const BLOCKED_HOSTS = /connatix|doubleclick|googlesyndication|googleadservices|googletagservices|scorecardresearch|hotjar|taboola|outbrain|facebook\.net|adnxs|pubmatic|rubiconproject|chartbeat|criteo|2mdn\.net|imasdk\.googleapis|teads\.tv|seedtag|smartadserver|aniview|vidoomy/;

function visitOle(url: string): void {
  cy.intercept({ url: BLOCKED_HOSTS }, { statusCode: 204, body: '' });
  cy.visit(url, { timeout: 60000, failOnStatusCode: false });
}

function waitForPageReady(): void {
  cy.get('body', { timeout: 20000 }).should('be.visible');
  cy.document().should('have.property', 'readyState', 'complete');
}

/** Dismiss the welcome / subscribe overlays when they are on screen. */
function dismissOlePopups(): void {
  cy.get('body').then(($body) => {
    const closeBtn = $body.find('[aria-label]').filter((_, el) => {
      const label = (el.getAttribute('aria-label') || '').toLowerCase();
      return label.includes('cerrar') || label.includes('close');
    }).filter(':visible');

    if (closeBtn.length > 0) {
      cy.wrap(closeBtn.first()).click({ force: true });
    }
  });
}

function openLigaProfesionalStandings(): void {
  cy.contains(/ver tabla/i, { timeout: 15000 })
    .filter(':visible')
    .first()
    .click({ force: true });

  cy.contains('td.name a', 'Atlético Tucumán', { timeout: 15000 }).should('exist');
}

describe('Football Results Fetcher – Visit Ole and dismiss popups', () => {
  beforeEach(() => {
    // Olé ships third-party players (Connatix and similar) that reject
    // after we stub their ad hosts. Those errors are outside this journey.
    cy.on('uncaught:exception', () => false);
  });

  it('opens Ole and dismisses popups', () => {
    visitOle(OLE_URL);
    waitForPageReady();
    dismissOlePopups();
    cy.url().should('include', 'ole.com.ar');
    cy.get('a[aria-label="Olé Resultados"]', { timeout: 15000 }).should('exist');
  });

  it('clicks OLÉ RESULTADOS and verifies the results screen', () => {
    visitOle(OLE_URL);
    waitForPageReady();
    dismissOlePopups();

    cy.get('a[aria-label="Olé Resultados"]', { timeout: 15000 })
      .filter(':visible')
      .first()
      .click({ force: true });

    cy.url({ timeout: 20000 }).should('include', 'estadisticas/futbol/home.html');
    cy.get('body', { timeout: 15000 }).should(($body) => {
      expect($body.text()).to.match(/liga profesional/i);
    });
    cy.contains(/ver tabla/i).filter(':visible').should('be.visible');
  });

  it('opens Liga Profesional standings', () => {
    visitOle(OLE_RESULTADOS_URL);
    waitForPageReady();
    dismissOlePopups();

    openLigaProfesionalStandings();

    cy.get('td.name', { timeout: 15000 }).filter(':visible').should('be.visible');
  });

  it('scrolls to Atlético Tucumán in the standings and opens their results', () => {
    visitOle(OLE_RESULTADOS_URL);
    waitForPageReady();
    dismissOlePopups();

    openLigaProfesionalStandings();

    cy.contains('td.name a', 'Atlético Tucumán', { timeout: 15000 })
      .scrollIntoView({ offset: { top: -150, left: 0 } })
      .click({ force: true });

    cy.url({ timeout: 20000 }).should('include', 'equipo.html');

    cy.contains('Atlético Tucumán', { timeout: 15000 })
      .filter(':visible')
      .should('be.visible');

    cy.get('li[selected] p', { timeout: 15000 })
      .should('be.visible')
      .invoke('text')
      .should('match', /resultados/i);
  });
});
