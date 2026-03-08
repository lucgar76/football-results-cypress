import { ScrapedMatchData, ScrapedData } from '../../src/types/results';

describe('Sky Sports Match Results Scraper', () => {
  it('should visit Sky Sports and extract match results', () => {
    const results: ScrapedMatchData[] = [];
    const scrapedData: ScrapedData = {
      rawMatches: [],
      scrapedAt: new Date().toISOString(),
      source: 'Sky Sports',
      url: 'https://www.skysports.com/football/competitions/premier-league/results',
      success: false,
    };

    // Visit the Sky Sports results page
    cy.visit('https://www.skysports.com/football/competitions/premier-league/results', {
      timeout: 30000,
    });

    // Wait for the page to load - adjust selector based on actual page structure
    cy.get('body', { timeout: 10000 }).should('be.visible');

    // Accept cookies if present (common on Sky Sports)
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="accept-all"], button:contains("Accept"), #onetrust-accept-btn-handler').length > 0) {
        cy.get('[data-testid="accept-all"], button:contains("Accept"), #onetrust-accept-btn-handler').first().click();
      }
    });

    // Wait a moment for any dynamic content to load
    cy.wait(2000);

    // Extract match results
    // Note: These selectors may need adjustment based on the actual Sky Sports HTML structure
    cy.get('body').then(($body) => {
      // Try multiple possible selectors for match containers
      const matchSelectors = [
        '.fixres__item',
        '.match-block',
        '[class*="match"]',
        '[data-testid*="match"]',
        '.swiper-slide',
      ];

      let matchElements: JQuery<HTMLElement> | null = null;

      for (const selector of matchSelectors) {
        const elements = $body.find(selector);
        if (elements.length > 0) {
          matchElements = elements;
          cy.log(`Found matches using selector: ${selector}`);
          break;
        }
      }

      if (matchElements && matchElements.length > 0) {
        cy.log(`Found ${matchElements.length} match elements`);

        // Extract data from each match element
        matchElements.each((index, element) => {
          const $match = Cypress.$(element);
          
          // Extract team names - adjust selectors based on actual structure
          const homeTeamName = $match.find('.fixres__item-team--home, [class*="home-team"], .team-home').text().trim() ||
                              $match.find('span:first-child, .team:first-child').text().trim();
          
          const awayTeamName = $match.find('.fixres__item-team--away, [class*="away-team"], .team-away').text().trim() ||
                              $match.find('span:last-child, .team:last-child').text().trim();

          // Extract scores
          const scoreText = $match.find('.fixres__item-score, [class*="score"], .score').text().trim() ||
                           $match.find('[class*="result"]').text().trim();
          
          // Parse score (format: "2-1" or "2 : 1")
          const scoreMatch = scoreText.match(/(\d+)[\s:–-]+(\d+)/);
          const homeScore = scoreMatch ? parseInt(scoreMatch[1], 10) : null;
          const awayScore = scoreMatch ? parseInt(scoreMatch[2], 10) : null;

          // Extract date/time
          const dateText = $match.find('.fixres__item-date, [class*="date"], .date').text().trim() ||
                          $match.closest('[class*="fixture"]').find('[class*="date"]').text().trim();

          // Extract competition/league
          const competition = $match.find('[class*="competition"], [class*="league"]').text().trim() ||
                             $match.closest('[class*="competition"]').find('h2, h3').text().trim();

          // Extract status
          const statusText = $match.find('[class*="status"], [class*="live"], .status').text().trim().toLowerCase();
          let status = 'finished';
          if (statusText.includes('live') || statusText.includes('playing')) {
            status = 'live';
          } else if (statusText.includes('scheduled') || statusText.includes('upcoming')) {
            status = 'scheduled';
          } else if (statusText.includes('postponed')) {
            status = 'postponed';
          }

          // Only add if we have meaningful data
          if (homeTeamName && awayTeamName) {
            const matchData: ScrapedMatchData = {
              matchId: `sky-sports-${index}-${Date.now()}`,
              date: dateText || new Date().toISOString(),
              homeTeamName: homeTeamName,
              awayTeamName: awayTeamName,
              homeScore: homeScore !== null ? homeScore : undefined,
              awayScore: awayScore !== null ? awayScore : undefined,
              status: status,
              competition: competition || 'Premier League',
            };

            results.push(matchData);
          }
        });
      } else {
        // Fallback: try to extract from any visible text structure
        cy.log('No match containers found, attempting alternative extraction');
        
        // Log the page structure for debugging
        cy.get('body').then(($body) => {
          cy.log('Page HTML structure (first 5000 chars):', $body.html().substring(0, 5000));
        });
      }
    });

    // After extraction, process and log results
    cy.then(() => {
      scrapedData.rawMatches = results;
      scrapedData.success = results.length > 0;
      scrapedData.metadata = {
        totalFound: results.length,
      };

      if (!scrapedData.success) {
        scrapedData.error = 'No match results found. Selectors may need adjustment.';
      }

      // Log the results
      cy.log(`Scraped ${results.length} matches`);
      cy.log('Sample match data:', JSON.stringify(results[0] || {}, null, 2));

      // Write results to a file (optional - requires cy.writeFile)
      // cy.writeFile('cypress/fixtures/skySportsResults.json', scrapedData);

      // Assert that we found at least some data
      expect(results.length).to.be.greaterThan(0);
    });
  });

  it('should handle different competition pages', () => {
    const competitions = [
      'premier-league',
      'championship',
      'la-liga',
      'serie-a',
    ];

    competitions.forEach((competition) => {
      cy.visit(`https://www.skysports.com/football/competitions/${competition}/results`, {
        timeout: 30000,
      });

      cy.get('body', { timeout: 10000 }).should('be.visible');
      
      // Accept cookies if needed
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="accept-all"], button:contains("Accept")').length > 0) {
          cy.get('[data-testid="accept-all"], button:contains("Accept")').first().click();
        }
      });

      cy.wait(2000);
      
      // Log that we visited the page
      cy.log(`Visited ${competition} results page`);
      
      // Extract matches (similar logic as above)
      // You can refactor the extraction logic into a reusable function
    });
  });
});
