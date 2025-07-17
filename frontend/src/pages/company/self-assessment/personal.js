import React, {useState} from 'react';
import avatars from 'assets/images/Avatar Group (24px).svg';
import Comments from './comments';
import Descriptor from './descriptor';
import Evidence from './evidence';

/**
 * Personal component for the Self-Assessment UI.
 * Renders tier-based tabbed navigation for "People Management Systems",
 * including descriptor, evidence upload, and comment sections.
 *
 * @component
 * @returns {JSX.Element} The rendered personal assessment view.
 */
const Personal = () => {
  // Local state to track the selected tab index
  const [tab, setTab] = useState(0);
  return (
    <div style={{width: '100%'}}>
      {/* Header section displaying the title and Add Member button */}
      <div className="flex-row-middle flex-space-between padding-x-10 padding-y-4 border-bottom-1px height-20 background-color-white sticky-top-0">
        <div>
          <h6 className="margin-bottom-1">People Management Systems</h6>
          <div className="text-small">Roles &amp; responsibilities</div>
        </div>
        <div className="flex-space-between flex-row-middle">
          <img src={avatars} loading="lazy" height="32" alt="" className="margin-right-3" />
          <a href="#!" className="button-secondary button-small w-button">
            Add member
          </a>
        </div>
      </div>
      {/* Tab navigation for switching between Tier 1, Tier 2, and Tier 3 */}
      <div data-duration-in="300" data-duration-out="100" className="w-tabs">
        <div className="flex-row-middle padding-x-10 background-color-white border-bottom-1px sticky-top-0 sticky-80px w-tab-menu">
          {/* Tab item for selecting the respective tier */}
          <a
            data-w-tab="Account"
            onClick={() => setTab(0)}
            className={`tab-link width-auto padding-x-4 w-inline-block w-tab-link ${tab === 0 && 'w--current'
            }`}
          >
            <div className="text-small">Tier 1</div>
          </a>
          {/* Tab item for selecting the respective tier */}
          <a
            data-w-tab="Team"
            onClick={() => setTab(1)}
            className={`tab-link width-auto padding-x-4 w-inline-block w-tab-link ${tab === 1 && 'w--current'
            }`}
          >
            <div className="text-small">Tier 2</div>
          </a>
          {/* Tab item for selecting the respective tier */}
          <a
            data-w-tab="Company"
            onClick={() => setTab(2)}
            className={`tab-link width-auto padding-x-4 w-inline-block w-tab-link ${tab === 2 && 'w--current'
            }`}
          >
            <div className="text-small">Tier 3</div>
          </a>
        </div>
      </div>
      {/* Section header and description for the indicator being assessed */}
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
      {/* Renders the descriptor input component */}
      <Descriptor />
      {/* Renders the evidence upload interface */}
      <Evidence />
      {/* Renders the comment section for this indicator */}
      <Comments />
      {/* Footer navigation with Previous and Next buttons */}
      <div className="sticky-bottom-0">
        <div className="background-color-white height-16 flex-row-middle flex-justify-end border-top-1px padding-x-10">
          <a href="#!" className="button-secondary button-small margin-right-3 w-button">
            Previous
          </a>
          <a href="#!" className="button button-small w-button">
            Next
          </a>
        </div>
      </div>
    </div>
  );
};

export default Personal;
