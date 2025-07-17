import React from 'react';
import logo from 'assets/mfilogo.png';
import arrowUp from 'assets/images/Arrow-Down20px.svg';

/**
 * LandingFooter component renders the footer section of the landing page.
 * Includes company info, useful links, and a scroll-to-top arrow.
 *
 * @returns {JSX.Element} The rendered footer component for the landing page.
 */
const LandingFooter = () => {
  return (
    // Wrapper container for the footer section layout
    <div className="container-1280 margin-bottom-10 wf-section">
      <div className="footer-10">
        <div className="container">
          <div className="w-layout-grid footer-grid-02">
            <div
              id="w-node-_5c35d527-7e3f-7442-fdbd-6d4eb5a800c3-da9fef06"
              className="footer-column"
            >
              {/* Displays the company logo */}
              <img src={logo} loading="lazy" width="150" alt="" className="margin-right-4" />
              {/* Displays copyright and
                  partner attribution */}
              <p className="text-small">
                © 2022 MFI Ltd.
                <br />
                Powered by <span className="link"><a href=" https://www.technoserve.org/" target="_blank">TechnoServe</a></span>
              </p>
            </div>
            {/* Links related to the company like contact and privacy policy */}
            <div className="footer-column">
              <div className="footer-title">Company</div>
              <a
                href="https://technoserve.gitbook.io/mfi-by-technoserve/contact-us"
                target="_blank"
                rel="noreferrer"
                className="footer-link-dark"
              >
                Contact
              </a>
              <a
                href="https://technoserve.gitbook.io/mfi-by-technoserve/privacy-policy"
                target="_blank"
                rel="noreferrer"
                className="footer-link-dark"
              >
                Privacy Policy
              </a>
            </div>
            {/* Informational links like FAQs and documentation */}
            <div className="footer-column">
              <div className="footer-title">About</div>
              <a
                href="https://technoserve.gitbook.io/mfi-by-technoserve/frequently-asked-questions-faqs"
                target="_blank"
                rel="noreferrer"
                className="footer-link-dark"
              >
                FAQs
              </a>
              <a
                href="https://technoserve.gitbook.io/mfi-by-technoserve/"
                target="_blank"
                rel="noreferrer"
                className="footer-link-dark"
              >
                Documentation
              </a>
            </div>
            {/* Scroll-to-top arrow button linking back to the Hero section */}
            <a href="#Hero" className="footer-arrow box-shadow-large w-inline-block">
              <img src={arrowUp} alt="" className="flip-vertical" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingFooter;
