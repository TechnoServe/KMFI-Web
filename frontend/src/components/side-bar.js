import {nanoid} from '@reduxjs/toolkit';
import React, {useEffect, useState} from 'react';
import logout from 'assets/images/Logout.svg';
import ReactSideBar from 'react-sidebar';
import PropTypes from 'prop-types';
import {ADMIN_SUB_ROUTES, IVC_SUB_ROUTES, PROTECTED_PATHS, SUB_ROUTES} from 'common';
import {Stack, useMediaQuery} from '@chakra-ui/react';
import {Switch, useRouteMatch, Route, Redirect, Link} from 'react-router-dom';
import NavBar from './Navbar';
import {isArray} from 'validate.js';
import {useDispatch, useSelector} from 'react-redux';
import {authLogout} from 'store/action-types';
import {companyNavs, ivcNavs, adminNavs} from './constants';
import logo from 'assets/mfilogo.png';

/**
 * SideBar is the main layout wrapper that displays a dynamic side navigation bar
 * with routes and role-based access for company, IVC, or admin users.
 * It also contains logic to handle logout and mobile responsiveness.
 *
 * @returns {JSX.Element} The main layout wrapper including sidebar and routed page content
 */
const {DASHBOARD} = PROTECTED_PATHS;

const SideBar = () => {
  // Redux dispatcher used for triggering logout
  const dispatch = useDispatch();
  // State to store the navigation items depending on the user type
  const [navBar, setNavBar] = useState(companyNavs);
  // Sidebar toggle state for mobile view
  const [isOpen, setIsOpen] = useState(false);
  // Media query hook to detect if screen size is at least 800px
  const [mobile] = useMediaQuery('(min-width: 800px)');
  // Retrieve logged-in user data from Redux store
  const user = useSelector((state) => state.auth.user);
  const currentLocation = window.location.pathname;
  const {path} = useRouteMatch();

  // console.log('user', user);

  /**
   * Clears user session data from localStorage and logs the user out.
   *
   * @returns {void}
   */
  const logoutUser = () => {
    localStorage.removeItem('company');
    localStorage.removeItem('TIER_1');
    localStorage.removeItem('TIER_2');
    localStorage.removeItem('TIER_3');
    localStorage.removeItem('mfi');
    dispatch(authLogout());
  };
  // Set sidebar navigation items based on user type on component mount or user change
  useEffect(() => {
    if (user.user_type.value === 'company') {
      setNavBar(companyNavs.filter((val) => val.name !== 'companies-index'));
    } else if (user?.admin_user?.role?.value === 'ivc' || user.user_type.value === 'ivc') {
      setNavBar(ivcNavs);
    } else if (user.user_type.value === 'admin') {
      setNavBar(adminNavs);
    }
  }, [user]);

  // Render the sidebar layout and main content area with routing
  return (
    // Sidebar wrapper component using 'react-sidebar' for responsive layout
    <ReactSideBar
      sidebar={
        <>
          <div className="w-row">
            <div className="padding-y-6 padding-x-6">
              <img src={logo} loading="lazy" width="200" alt="" className="margin-right-4" />
            </div>

            {
              // Dynamically generate sidebar links based on navigation structure
              navBar.map((item) =>
                !isArray(item) ? (
                  <Link
                    key={nanoid()}
                    to={`${path}/${item.to}`}
                    className={`padding-y-4 padding-x-4 flex-space-between flex-row-middle b-tab-menu ${currentLocation.includes(item.name) && 'background-color-4'
                    }`}
                  >
                    <div className="flex-row-middle b-tab-link">
                      <img
                        src={currentLocation.includes(item.name) ? item.icon2 : item.icon}
                        loading="lazy"
                        alt=""
                      />
                      <div
                        className={`${currentLocation.includes(item.name) ? 'text-color-1' : 'text-color-4 '
                        } padding-left-4`}
                        style={{
                          textTransform: 'capitalize',
                          fontSize: 16,
                          fontFamily: 'DM Sans',
                          fontStyle: 'normal',
                          fontWeight: 500,
                          lineHeight: '21px',
                          letterSpacing: '0px',
                          textAlign: 'left',
                        }}
                      >
                        {item.name}
                      </div>
                    </div>
                    {item.notification && (
                      <div className="div-block padding-x-2 rounded-full">
                        <div className="text-color-4 text-small">{item.notification}</div>
                      </div>
                    )}
                  </Link>
                ) : path === '/company' ? (
                  <Link
                    key={nanoid()}
                    to={`${path}/${item[0].to}`}
                    className={`padding-y-4 padding-x-4 flex-space-between flex-row-middle b-tab-menu ${currentLocation.includes(item[0].name) && 'background-color-4'
                    }`}
                  >
                    <div className="flex-row-middle b-tab-link">
                      <img
                        src={currentLocation.includes(item[0].name) ? item[0].icon2 : item[0].icon}
                        loading="lazy"
                        alt=""
                      />
                      <div
                        className={`${currentLocation.includes(item[0].name) ? 'text-color-1' : 'text-color-4 '
                        } padding-left-4`}
                        style={{
                          textTransform: 'capitalize',
                          fontSize: 16,
                          fontFamily: 'DM Sans',
                          fontStyle: 'normal',
                          fontWeight: 500,
                          lineHeight: '21px',
                          letterSpacing: '0px',
                          textAlign: 'left',
                        }}
                      >
                        {item[0].name}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <Link
                    key={nanoid()}
                    to={`${path}/${item[1].to}`}
                    className={`padding-y-4 padding-x-4 flex-space-between flex-row-middle b-tab-menu ${currentLocation.includes(item[1].name) && 'background-color-4'
                    }`}
                  >
                    <div className="flex-row-middle b-tab-link">
                      <img src={item[1].icon} loading="lazy" alt="" />
                      <div
                        className={`${currentLocation.includes(item[1].name) ? 'text-color-1' : 'text-color-4 '
                        } padding-left-4`}
                        style={{
                          textTransform: 'capitalize',
                          fontSize: 16,
                          fontFamily: 'DM Sans',
                          fontStyle: 'normal',
                          fontWeight: 500,
                          lineHeight: '21px',
                          letterSpacing: '0px',
                          textAlign: 'left',
                        }}
                      >
                        {item[1].name}
                      </div>
                    </div>
                  </Link>
                )
              )}
            <Stack
              // Logout button anchored to the bottom of the sidebar
              onClick={logoutUser}
              _hover={{background: 'gray', cursor: 'pointer'}}
              className="absolute-bottom margin-bottom-20 cursor-click"
            >
              <div className="padding-y-4 padding-x-4 flex-row-middle">
                <div className="flex-row-middle">
                  <img src={logout} loading="lazy" alt="" />
                  <div className="text-color-4 padding-left-4">Logout</div>
                </div>
              </div>
            </Stack>
          </div>
        </>
      }
      open={isOpen}
      onSetOpen={() => setIsOpen(false)}
      docked={mobile}
      shadow={false}
      styles={{
        sidebar: {background: '#1e1f24', width: 240},
        root: {height: '100vh'},
      }}
    >
      <div className="padding-0 background-color-4" style={{height: '100vh'}}>
        <NavBar showSideBar={() => setIsOpen(true)} />
        {
          // Role-based routing logic to render pages for admin, IVC, or company users
        }
        <Switch>
          {user.user_type.value === 'ivc'
            ? IVC_SUB_ROUTES.map(({page: Component, path: route, exact}) => (
              <Route exact={exact} key={nanoid()} path={`${path}/${route}`}>
                <Component showSideBar={() => setIsOpen(true)} />
              </Route>
            ))
            : user.user_type.value === 'admin'
              ? ADMIN_SUB_ROUTES.map(({page: Component, path: route, exact}) => (
                <Route exact={exact} key={nanoid()} path={`${path}/${route}`}>
                  <Component showSideBar={() => setIsOpen(true)} />
                </Route>
              ))
              : SUB_ROUTES.map(({page: Component, path: route, exact}) => (
                <Route exact={exact} key={nanoid()} path={`${path}/${route}`}>
                  <Component showSideBar={() => setIsOpen(true)} />
                </Route>
              ))}

          {
            // Catch-all route to redirect to dashboard if no other route matches
          }
          <Route exact path="/*">
            <Redirect to={`${path}/${DASHBOARD}`} />
          </Route>
        </Switch>
      </div>
    </ReactSideBar>
  );
};
SideBar.propTypes = {
  screen: PropTypes.number,
};

export default SideBar;
