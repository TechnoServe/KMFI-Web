import React, {Component} from 'react';
import confirmationIfg from 'assets/images/confirmation.png';

/**
 * Fragment component displays a confirmation message after registration or login.
 * It includes an illustration and text prompting the user to verify their email.
 */
class Fragment extends Component {
  /**
   * Constructor for the Fragment component.
   *
   * @param {Object} props - Component properties passed from the parent
   */
  constructor(props) {
    super(props);
  }
  /**
   * Render method for the Fragment component.
   *
   * @returns {JSX.Element} The confirmation UI with an image and verification message
   */
  render() {
    return (
      <>
        {/* // Centered image container with a confirmation illustration */}
        <div className="grid place-items-center mb-5">
          <img src={confirmationIfg} width="80" className="block" />
        </div>
        {/* // Text container showing a message to verify the user's email */}
        <div className="text-center mb-28">
          {/* // Title prompting email verification */}
          <h4 className="text-2xl font-bold mb-3">Verify your email</h4>
          {/* // Instructional message indicating the email has been sent */}
          <p className="text-sm text-gray-800">
            A verification link has been sent to your mail. <br /> Use the link to access your
            account.
          </p>
        </div>
      </>
    );
  }
}

export default Fragment;
