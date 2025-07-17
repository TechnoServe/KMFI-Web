import React from 'react';
import styled from '@emotion/styled';
import {FaBars} from 'react-icons/fa';
import {useMediaQuery} from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * NavBar component renders a top navigation bar with a sidebar toggle button
 * and dynamic page title based on the URL path.
 *
 * It hides the navbar on specific routes like 'self-assessment' or 'companylist'.
 *
 * @param {Object} props - Component properties
 * @param {Function} props.showSideBar - Callback function to trigger sidebar visibility
 * @returns {JSX.Element|string} The navbar element or an empty string for excluded paths
 */
const NavBar = (props) => {
  const {showSideBar} = props;
  // Chakra UI hook to detect screen width and determine if it's a mobile view
  const [mobile] = useMediaQuery('(min-width: 800px)');

  // Conditionally render the NavBar only if not on 'self-assessment' or 'companylist' paths
  return window.location.pathname.split('/')[2] === 'self-assessment' || 'companylist' ? (
    ''
  ) : (
    // Render NavBar container with sidebar button and dynamic page heading
    <NavBar.Wrapper className="border-bottom-1px sticky-top-0">
      {/* Sidebar toggle button (hidden on wider screens) */}
      <button className={`${mobile ? 'active' : ''}`} onClick={() => showSideBar()}>
        {' '}
        <FaBars />{' '}
      </button>
      {/* Page title section extracted from the current pathname */}
      <div className="holder">
        <h2> {window.location.pathname.split('/')[2]} </h2>
      </div>
    </NavBar.Wrapper>
  );
};
NavBar.Wrapper = styled.nav`
  display: flex;
  align-items: center;
  background-color: #fff;
  padding-top: 26px;
  padding-bottom: 26px;
  padding-left: 40px;
  position: sticky;
  top: 0;
  z-index: 10;
  @media only screen and (max-width: 600px) {
    padding-left: 12px;
    padding-top: 16px;
    padding-bottom: 16px;
  }

  .holder {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    .logos {
      display: flex;
      margin-right: 1rem;
      svg {
        color: #8a94a6;
        font-size: 1.3rem;
        margin-left: 1rem;
      }
    }
  }
  h2 {
    font-size: 17px;
    line-height: 0;
    text-transform: capitalize;
  }
  button {
    margin-right: 1rem;
    outline: none;
    svg {
      font-size: 1.3rem;
      color: #304762;
    }
  }
  .active {
    display: none !important;
  }
`;

NavBar.propTypes = {
  showSideBar: PropTypes.any,
};

export default NavBar;
