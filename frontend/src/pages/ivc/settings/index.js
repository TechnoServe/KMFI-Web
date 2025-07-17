import React, {useState} from 'react';
import Account from './components/account';
const Settings = () => {
  /**
   * Renders the settings page with tabbed navigation.
   *
   * @returns {JSX.Element} The rendered settings component with tabs.
   */
  // State to track the currently selected tab (0 = Account tab)
  const [tab, setTab] = useState(0);
  /**
   * Handle form submission
   * @param {Event} val
   * @return {undefined}
   */
  return (
    <>
      <div className="padding-0 background-color-4">
        <div className="padding-y-24">
          <div className="background-color-white container-480 padding-0 box-shadow-small rounded-large">
            <div data-duration-in="300" data-duration-out="100" className="w-tabs">
              <div className="padding-x-10 border-bottom-1px flex-row-middle w-tab-menu">
                {/* Tab selector for the Account section. Sets tab to 0 on click. */}
                <a
                  data-w-tab="Account"
                  onClick={() => setTab(0)}
                  className={`tab-link w-inline-block w-tab-link ${tab === 0 && 'w--current'}`}
                >
                  <div className="text-small">Account</div>
                </a>
              </div>
              <div className="w-tab-content overflow-visible">
                {/* Render the Account settings component content */}
                <Account />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
