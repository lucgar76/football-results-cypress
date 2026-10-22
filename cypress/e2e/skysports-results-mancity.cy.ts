/// <reference types="cypress" />

/**
 * E2E: Open Sky Sports, accept cookies, navigate to Manchester City
 * scores and the Premier League table.
 *
 * Scores is a header dropdown. Football scores live at /football-scores-fixtures.
 */

const SKYSPORTS_URL = 'https://www.skysports.com/';

const TIMEOUT = {
  pageLoad:   60000,
  navigation: 20000,
  element:    15000,
  fast:       10000,
  cookie:     20000,
};

Cypress.on('uncaught:exception', () => false);

const BLOCKED_HOSTS = /privacy-mgmt|sourcepoint|doubleclick|googlesyndication|googleadservices|googletagservices|googletagmanager|google-analytics|scorecardresearch|hotjar|facebook\.net|adnxs|pubmatic|rubiconproject|chartbeat|criteo|2mdn\.net|imasdk|teads|moatads|amazon-adsystem|quantserve|newrelic|nr-data|demdex|omtrdc|adsrvr|adsafeprotected|taboola|outbrain|brightcove|freewheel/;

function findAcceptAllButton(iframe: HTMLIFrameElement): HTMLElement | undefined {
  const body = iframe.contentDocument?.body;
  if (!body) return undefined;

  const byTitle = body.querySelector<HTMLElement>('[title="Accept all"]');
  if (byTitle) return byTitle;

  return Array.from(body.querySelectorAll<HTMLElement>('button, [role="button"]')).find((button) =>
    /accept all/i.test(button.textContent ?? '') || /accept all/i.test(button.getAttribute('aria-label') ?? '')
  );
}

/**
 * Accept the Sky Sports cookie popup when Sourcepoint injects it.
 * Headless Chrome often never shows it; Electron usually does, and it can
 * arrive after the first paint. Wait, then continue if it never mounts.
 */
function acceptSkySportsCookies(waitMs = 8000): void {
  cy.then(() => {
    const started = Date.now();

    cy.get('body', { timeout: waitMs + 7000 }).should(($body) => {
      const iframe = $body.find('iframe[src*="privacy-mgmt"]').get(0) as HTMLIFrameElement | undefined;
      if (iframe && findAcceptAllButton(iframe)) return;
      expect(Date.now() - started, 'cookie iframe wait').to.be.gte(waitMs);
    }).then(($body) => {
      const iframe = $body.find('iframe[src*="privacy-mgmt"]').get(0) as HTMLIFrameElement | undefined;
      const button = iframe ? findAcceptAllButton(iframe) : undefined;
      if (!button) return;

      cy.wrap(button).click({ force: true });
      cy.get('body', { timeout: TIMEOUT.element }).should(($after) => {
        const stillVisible = $after.find('iframe[src*="privacy-mgmt"]').filter(':visible');
        expect(stillVisible.length, 'cookie iframe dismissed').to.eq(0);
      });
    });
  });
}

describe('Sky Sports – Scores and Man City results', () => {
  beforeEach(() => {
    // Ad and consent hosts often never finish, so the window load event never fires.
    cy.intercept({ url: BLOCKED_HOSTS }, { statusCode: 204, body: '' });
  });

  it('enters Sky Sports and accepts cookies', () => {
    cy.visit(SKYSPORTS_URL, { timeout: TIMEOUT.pageLoad });
    cy.document().should('have.property', 'readyState', 'complete');
    cy.get('body').should('be.visible');

    acceptSkySportsCookies();

    cy.url().should('include', 'skysports.com');
    cy.get('#ui-sitewide-main-nav-uk-scores').should('be.visible');
  });

  it('opens Football scores and reaches the Manchester City Premier League table', () => {
    cy.visit(SKYSPORTS_URL, { timeout: TIMEOUT.pageLoad });
    cy.document().should('have.property', 'readyState', 'complete');
    cy.get('body').should('be.visible');

    acceptSkySportsCookies();

    cy.get('#ui-sitewide-main-nav-uk-scores', { timeout: TIMEOUT.element })
      .filter(':visible')
      .first()
      .click({ force: true });

    cy.get('#ui-sitewide-main-nav-uk-scores-subnav a[href="/football-scores-fixtures"]', { timeout: TIMEOUT.element })
      .filter(':visible')
      .first()
      .click({ force: true });

    cy.url({ timeout: TIMEOUT.navigation }).should('include', 'football-scores-fixtures');

    acceptSkySportsCookies(2000);

    cy.get('[data-role="short-text-target"]', { timeout: TIMEOUT.navigation })
      .contains('Scores & Fixtures')
      .should('exist');

    cy.get('[aria-controls="sdc-site-localnav-select-menu-teams"]', { timeout: TIMEOUT.element })
      .filter(':visible')
      .first()
      .click({ force: true });

    cy.get('#sdc-site-localnav-select-menu-teams', { timeout: TIMEOUT.element })
      .filter(':visible')
      .first()
      .within(() => {
        cy.get('a[href="/manchester-city"]')
          .scrollIntoView()
          .click({ force: true });
      });

    cy.url({ timeout: TIMEOUT.navigation }).should('include', 'manchester-city');

    cy.get('a.sdc-site-localnav__header-title', { timeout: TIMEOUT.element })
      .contains('Man City')
      .should('exist');

    acceptSkySportsCookies(2000);

    cy.get('a[href="/manchester-city-scores-fixtures"]', { timeout: TIMEOUT.element })
      .filter(':visible')
      .first()
      .scrollIntoView()
      .click({ force: true });

    cy.url({ timeout: TIMEOUT.navigation }).should('include', 'manchester-city-scores-fixtures');

    cy.get('[data-role="short-text-target"]', { timeout: TIMEOUT.element })
      .contains('Scores & Fixtures')
      .should('exist');

    cy.get('a[href="/premier-league-table"]', { timeout: TIMEOUT.element })
      .filter(':visible')
      .last()
      .scrollIntoView({ duration: 500 })
      .click({ force: true });

    cy.url({ timeout: TIMEOUT.navigation }).should('include', 'premier-league-table');

    cy.get('a.sdc-site-table__table-heading-link', { timeout: TIMEOUT.navigation })
      .contains('Premier League')
      .should('exist');

    acceptSkySportsCookies(2000);
  });
});
