import React, {useState} from 'react';
import Account from './components/account';
// import Company from './components/company';
import SaTool from './components/SaTool';
import Team from './components/team';
import CompanyUsers from './components/companyUsers';
import Companies from './components/companies';
import GlobalTool from './components/globalTool';

const Settings = () => {
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
          <div className="background-color-white container-768 padding-0 box-shadow-small rounded-large">
            <div data-duration-in="300" data-duration-out="100" className="w-tabs">
              <div className="padding-x-10 border-bottom-1px flex-row-middle w-tab-menu">
                <a
                  data-w-tab="Account"
                  onClick={() => setTab(0)}
                  className={`tab-link w-inline-block w-tab-link ${tab === 0 && 'w--current'}`}
                >
                  <div className="text-small">Account</div>
                </a>
                <a
                  data-w-tab="Admin Team"
                  onClick={() => setTab(1)}
                  className={`tab-link w-inline-block w-tab-link ${tab === 1 && 'w--current'}`}
                >
                  <div className="text-small">Team</div>
                </a>
                <a
                  data-w-tab="Company Users"
                  onClick={() => setTab(2)}
                  className={`tab-link w-inline-block w-tab-link ${tab === 2 && 'w--current'}`}
                >
                  <div className="text-small">Users</div>
                </a>
                <a
                  data-w-tab="Companies"
                  onClick={() => setTab(3)}
                  className={`tab-link w-inline-block w-tab-link ${tab === 3 && 'w--current'}`}
                >
                  <div className="text-small">Companies</div>
                </a>
                <a
                  data-w-tab="Company"
                  onClick={() => setTab(4)}
                  className={`tab-link w-inline-block w-tab-link ${tab === 4 && 'w--current'}`}
                >
                  <div className="text-small">SA Tool</div>
                </a>
                <a
                  data-w-tab="Global Tool"
                  onClick={() => setTab(5)}
                  className={`tab-link w-inline-block w-tab-link ${tab === 5 && 'w--current'}`}
                >
                  <div className="text-small">Global Tool</div>
                </a>
              </div>
              <div className="w-tab-content">
                {tab === 0 ? (
                  <Account />
                ) : tab === 1 ? (
                  <Team
                  />
                ) : tab === 2 ? (
                  <CompanyUsers
                  />
                ) : tab === 3 ? (
                  <Companies
                  />
                ) : tab === 4 ? (
                  <SaTool
                  />
                ) : (
                  <GlobalTool />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
