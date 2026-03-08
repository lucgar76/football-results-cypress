/// <reference types="cypress" />

/**
 * E2E: Open Sky Sports, accept cookies, navigate to Scores page.
 */

const SKYSPORTS_URL = 'https://www.skysports.com/';

const TIMEOUT = {
  pageLoad:   30000,  // cy.visit and full page readiness
  navigation: 15000,  // URL assertion after page navigation
  element:    10000,  // standard element lookup
  fast:        6000,  // element lookup on already-loaded pages
  cookie:     15000,  // cookie iframe initialisation
};

Cypress.on('uncaught:exception', () => false);

/** Accept the Sky Sports cookie consent popup if present (loaded inside a privacy-mgmt iframe). */
function acceptSkySportsCookies(): void {
  cy.get('body').then(($body) => {
    if ($body.find('iframe[src*="privacy-mgmt"]').length > 0) {
      cy.get('iframe[src*="privacy-mgmt"]', { timeout: TIMEOUT.cookie })
        .its('0.contentDocument.body')
        .should('not.be.empty')
        .then(cy.wrap)
        .find('[title="Accept all"]', { timeout: TIMEOUT.element })
        .click({ force: true });
    }
  });
}

describe('Sky Sports – Scores and Man City results', () => {

  it('enters Sky Sports and accepts cookies', () => {
    cy.visit(SKYSPORTS_URL, { timeout: TIMEOUT.pageLoad });
    cy.document().should('have.property', 'readyState', 'complete');
    cy.get('body').should('be.visible');

    acceptSkySportsCookies();

    cy.url().should('include', 'skysports.com');
  });

  it('clicks Scores and arrives at the live scores page', () => {
    cy.visit(SKYSPORTS_URL, { timeout: TIMEOUT.pageLoad });
    cy.document().should('have.property', 'readyState', 'complete');
    cy.get('body').should('be.visible');

    acceptSkySportsCookies();

    // Click the Scores nav link
    cy.get('a[href="/live-scores"]', { timeout: TIMEOUT.element })
      .filter(':visible')
      .first()
      .click({ force: true });

    // Verify navigation to the live scores page
    cy.url({ timeout: TIMEOUT.navigation }).should('include', 'live-scores');

    // Dismiss cookie popup if it reappears after navigation
    acceptSkySportsCookies();

    // Verify the scores page has loaded
    cy.get('[title="Live Football Scores"]', { timeout: TIMEOUT.navigation }).should('exist');

    // Scroll down until the Football Schedule & Results link is visible and click it
    cy.get('a[href="/football/fixtures-results"]', { timeout: TIMEOUT.element })
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });

    // Verify navigation to the scores & fixtures page (redirects to football-scores-fixtures)
    cy.url({ timeout: TIMEOUT.navigation }).should('include', 'football-scores-fixtures');

    // Dismiss cookie popup if it reappears after navigation
    acceptSkySportsCookies();

    // Assert the Scores & Fixtures page has loaded
    cy.get('[data-role="short-text-target"]', { timeout: TIMEOUT.navigation })
      .contains('Scores & Fixtures')
      .should('exist');

    // Click the Teams dropdown button
    cy.get('[aria-controls="sdc-site-localnav-select-menu-teams"]', { timeout: TIMEOUT.element })
      .should('be.visible')
      .click({ force: true });

    // Scroll within the dropdown until Manchester City is visible, then click it
    cy.get('#sdc-site-localnav-select-menu-teams', { timeout: TIMEOUT.element })
      .should('be.visible')
      .within(() => {
        cy.get('a[href="/manchester-city"]')
          .scrollIntoView()
          .should('be.visible')
          .click({ force: true });
      });

    // Verify navigation to Man City scores & fixtures
    cy.url({ timeout: TIMEOUT.navigation }).should('include', 'manchester-city');

    // Assert the Manchester City page has loaded
    cy.get('a.sdc-site-localnav__header-title', { timeout: TIMEOUT.element })
      .contains('Man City')
      .should('exist');

    // Dismiss cookie popup if it reappears
    acceptSkySportsCookies();

    // Scroll down until the Scores & Fixtures section link is visible and click it
    cy.get('a[href="/manchester-city-scores-fixtures"]', { timeout: TIMEOUT.fast })
      .filter(':visible')
      .first()
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });

    // Verify navigation to Man City Scores & Fixtures page
    cy.url({ timeout: TIMEOUT.navigation }).should('include', 'manchester-city-scores-fixtures');

    // Assert the Scores & Fixtures page has loaded
    cy.get('[data-role="short-text-target"]', { timeout: TIMEOUT.element })
      .contains('Scores & Fixtures')
      .should('exist');

    // Scroll down to the last 'View table' link and click it
    cy.get('a[href="/premier-league-table"]', { timeout: TIMEOUT.fast })
      .filter(':visible')
      .last()
      .scrollIntoView({ duration: 500 })
      .click({ force: true });

    // Verify navigation to the Premier League table page
    cy.url({ timeout: TIMEOUT.navigation }).should('include', 'premier-league-table');

    // Assert the Premier League table page has loaded
    cy.get('a.sdc-site-table__table-heading-link', { timeout: TIMEOUT.navigation })
      .contains('Premier League')
      .should('exist');

    // Dismiss cookie popup if it reappears
    acceptSkySportsCookies();
  });
});
