/// <reference types="cypress" />

/**
 * E2E: Open Ole, dismiss popups, navigate to Resultados.
 */

const OLE_URL = 'https://www.ole.com.ar/';
const OLE_RESULTADOS_URL = 'https://www.ole.com.ar/estadisticas/futbol/home.html';

/** Wait for the page network activity to settle before interacting. */
function waitForPageReady(): void {
  cy.get('body').should('be.visible');
  cy.document().should('have.property', 'readyState', 'complete');
}

/** Dismiss common popups on Ole (banner, modals). */
function dismissOlePopups(): void {
  cy.get('body').then(($body) => {
    const banner = $body.find(
      '.bannerTopHeader, [class*="bannerTopHeader"], [class*="banner"], [class*="modal"]'
    );
    if (banner.length > 0) {
      const closeBtn = banner.find(
        'button, [aria-label*="close"], [aria-label*="cerrar"], .close, [class*="close"], [class*="dismiss"]'
      ).first();
      if (closeBtn.length > 0) {
        cy.wrap(closeBtn).click({ force: true });
      }
    }
  });
}

describe('Football Results Fetcher – Visit Ole and dismiss popups', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', (err) => {
      if (
        err.message.includes('postMessage') ||
        err.message.includes('Cannot read properties of null')
      ) {
        return false;
      }
      return true;
    });
  });

  it('opens Ole and dismisses popups', () => {
    cy.visit(OLE_URL, { timeout: 30000 });
    waitForPageReady();
    dismissOlePopups();
    cy.url().should('include', 'ole.com.ar');
  });

  it('clicks OLÉ RESULTADOS and verifies the results screen', () => {
    cy.visit(OLE_URL, { timeout: 30000 });
    waitForPageReady();
    dismissOlePopups();

    // Wait for the nav link to be present before clicking
    cy.get('[aria-label="Olé Resultados"]', { timeout: 5000 })
      .filter(':visible')
      .first()
      .click({ force: true });

    // Verify navigation to the results page
    cy.url({ timeout: 5000 }).should('include', 'estadisticas/futbol/home.html');

    // Verify the results screen has loaded with a visible element from the main content
    cy.contains('h2', 'Liga Profesional', { timeout: 5000 }).should('be.visible');
  });

  it('clicks Ver tabla to open the league standings dropdown', () => {
    cy.visit(OLE_RESULTADOS_URL, { timeout: 5000 });
    waitForPageReady();
    dismissOlePopups();

    // Wait for "Ver tabla" to be present, then click
    cy.contains('Ver tabla', { timeout: 5000 })
      .filter(':visible')
      .first()
      .click({ force: true });

    // Verify the standings table is now visible (rows with team positions)
    cy.get('div.table', { timeout: 5000 }).should('be.visible');
  });

  it('scrolls to Atlético Tucumán in the standings and opens their results', () => {
    cy.visit(OLE_RESULTADOS_URL, { timeout: 30000 });
    waitForPageReady();
    dismissOlePopups();

    // Open the standings dropdown first
    cy.contains('Ver tabla', { timeout: 5000 })
      .filter(':visible')
      .first()
      .click({ force: true });

    // Wait for the table to render, then scroll to and click Atlético Tucumán
    cy.contains('td.name a', 'Atlético Tucumán', { timeout: 5000 })
      .scrollIntoView({ offset: { top: -150, left: 0 } })
      .should('be.visible')
      .click({ force: true });

    // Verify navigation to the team results page
    cy.url({ timeout: 5000 }).should('include', 'equipo.html');

    // Verify the team results screen has loaded
    cy.contains('Atlético Tucumán', { timeout: 5000 })
      .filter(':visible')
      .should('be.visible');
    cy.get('li[selected] p', { timeout: 5000 })
      .should('be.visible')
      .and('have.text', 'Resultados');
  });
});
