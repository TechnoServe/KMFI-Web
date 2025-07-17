import React, {useState} from 'react';
import avatars from 'assets/images/Avatar Group (24px).svg';

/**
 * Renders the Personal (People Management Systems) tabbed view for the IVC self-assessment page.
 *
 * @returns {JSX.Element} The rendered Personal self-assessment section including navigation tabs and descriptive content.
 */
const Personal = () => {
  // Tracks the active tab index (0 for Tier 1, 1 for Tier 2, 2 for Tier 3)
  const [tab, setTab] = useState(0);
  return (
    <div style={{width: '100%'}}>
      {/* Header with section title and action button */}
      <div className="flex-row-middle flex-space-between padding-x-10 padding-y-4 border-bottom-1px height-20 background-color-white sticky-top-0">
        <div>
          <h6 className="margin-bottom-1">People Management Systems</h6>
          <div className="text-small">Roles &amp; responsibilities</div>
        </div>
        <div className="flex-space-between flex-row-middle">
          <img src={avatars} loading="lazy" height="32" alt="" className="margin-right-3" />
          <a href="#" className="button-secondary button-small w-button">
            Add member
          </a>
        </div>
      </div>
      <div data-duration-in="300" data-duration-out="100" className="w-tabs">
        {/* Tab navigation for different management tiers */}
        <div className="flex-row-middle padding-x-10 background-color-white border-bottom-1px sticky-top-0 sticky-80px w-tab-menu">
          <a
            data-w-tab="Account"
            // Set tab to corresponding tier index when clicked
            onClick={() => setTab(0)}
            className={`tab-link width-auto padding-x-4 w-inline-block w-tab-link ${
              tab === 0 && 'w--current'
            }`}
          >
            <div className="text-small">Tier 1</div>
          </a>
          <a
            data-w-tab="Team"
            // Set tab to corresponding tier index when clicked
            onClick={() => setTab(1)}
            className={`tab-link width-auto padding-x-4 w-inline-block w-tab-link ${
              tab === 1 && 'w--current'
            }`}
          >
            <div className="text-small">Tier 2</div>
          </a>
          <a
            data-w-tab="Company"
            // Set tab to corresponding tier index when clicked
            onClick={() => setTab(2)}
            className={`tab-link width-auto padding-x-4 w-inline-block w-tab-link ${
              tab === 2 && 'w--current'
            }`}
          >
            <div className="text-small">Tier 3</div>
          </a>
        </div>
      </div>
      {/* Descriptive header and explanation text for this assessment indicator */}
      <div className="padding-x-10 margin-top-8 margin-bottom-5">
        <div>
          <div className="padding-bottom-5 border-bottom-1px">
            <h4 className="margin-bottom-2">People Management Systems - Roles &amp; responsibilities</h4>
            <div className="text-base medium text-color-body-text">
              Structural alignment, JDs, clarity
            </div>
          </div>
        </div>
        <div>
          <div className="margin-top-5">
            This indicator assesses the adequacy of the structure, independence and organisation of
            your company&#x27;s quality assurance function.
          </div>
        </div>
      </div>
      {/* <Descriptor /> */}
      {/* <Evidence /> */}
      {/* <Comments /> */}
      {/* Navigation buttons at the bottom of the page */}
      <div className="sticky-bottom-0">
        <div className="background-color-white height-16 flex-row-middle flex-justify-end border-top-1px padding-x-10">
          <a href="#" className="button-secondary button-small margin-right-3 w-button">
            Previous
          </a>
          <a href="#" className="button button-small w-button">
            Next
          </a>
        </div>
      </div>
    </div>
  );
};

export default Personal;
