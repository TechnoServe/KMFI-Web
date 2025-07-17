import React from 'react';
import fileZip from 'assets/images/tabler_file-zipThumbnail.svg';
import videoZip from 'assets/images/fi_videoThumbnail.svg';
import musicZip from 'assets/images/fi_musicThumbnail.svg';
import imageZip from 'assets/images/fi_imageThumbnail.svg';
import fileImg from 'assets/images/fi_fileThumbnail.svg';
import dropBox from 'assets/images/dropboxUpload.svg';
import driveUpload from 'assets/images/google_driveUpload.svg';
import systemUpload from 'assets/images/Frame 357Upload.svg';
import nav from 'assets/images/fi_xNavigation.svg';

/**
 * UploadFileModal renders a modal UI displaying recent file uploads
 * and upload options from various sources like Google Drive and Dropbox.
 *
 * @component
 * @returns {JSX.Element} The rendered modal interface for file uploads.
 */
const UploadFileModal = () => {
  // Render the modal container with dark translucent background
  return (
    <div
      id="w-node-dbf9b094-6509-3aa7-baa5-30ce1ca52d11-61a8069a"
      className="flex-row-middle flex-align-start width-full height-viewport-full background-color-black-50 flex-row-middle flex-column-centered absolute-full sticky position-modal "
    >
      {/* Modal box containing recent uploads and upload options */}
      <div className="background-color-white border-1px padding-10 box-shadow-large rounded-large width-192">
        {/* Header for recent uploads section with a "See all" link */}
        <div className="flex-row-middle flex-space-between margin-bottom-5">
          <h6 className="margin-bottom-0 weight-medium">Recent uploads</h6>
          <div className="padding-2">
            <div className="text-small text-color-green">See all</div>
          </div>
        </div>
        {/* Display a grid of recent uploaded files with preview thumbnails and labels */}
        <div className="grid-5-columns padding-bottom-10 border-bottom-1px">
          <div className="border-1px rounded-large">
            <div className="padding-y-4 flex-justify-center background-color-4">
              <img src={fileImg} loading="lazy" width="36" height="36" alt="" />
            </div>
            <div className="background-color-white border-top-1px flex-justify-center padding-y-2">
              <div className="text-tiny">A PDF file.pdf</div>
            </div>
          </div>
          <div className="border-1px rounded-large">
            <div className="padding-y-4 flex-justify-center background-color-4">
              <img src={videoZip} loading="lazy" width="36" height="36" alt="" />
            </div>
            <div className="background-color-white border-top-1px flex-justify-center padding-y-2">
              <div className="text-tiny">A Video file.mp4</div>
            </div>
          </div>
          <div className="border-1px rounded-large">
            <div className="padding-y-4 flex-justify-center background-color-4">
              <img src={musicZip} loading="lazy" width="36" height="36" alt="" />
            </div>
            <div className="background-color-white border-top-1px flex-justify-center padding-y-2">
              <div className="text-tiny">An Audio file.mp3</div>
            </div>
          </div>
          <div className="border-1px rounded-large">
            <div className="padding-y-4 flex-justify-center background-color-4">
              <img src={imageZip} loading="lazy" width="36" height="36" alt="" />
            </div>
            <div className="background-color-white border-top-1px flex-justify-center padding-y-2">
              <div className="text-tiny">An Image file.pdf</div>
            </div>
          </div>
          <div className="border-1px rounded-large">
            <div className="padding-y-4 flex-justify-center background-color-4">
              <img src={fileZip} loading="lazy" width="36" height="36" alt="" />
            </div>
            <div className="background-color-white border-top-1px flex-justify-center padding-y-2">
              <div className="text-tiny">Unknown file.xyz</div>
            </div>
          </div>
        </div>
        {/* Header for the upload options section */}
        <div className="flex-row-middle flex-space-between padding-top-10 margin-bottom-5">
          <h6 className="margin-bottom-0 weight-medium">Upload a file from...</h6>
        </div>
        {/* Grid of file source options for upload (Google Drive, Dropbox, etc.) */}
        <div className="grid-3-columns width-10-12">
          <div className="background-secondary-2 rounded-large flex-column-centered padding-4">
            <img src={systemUpload} loading="lazy" width="120" alt="" />
            <div className="text-tiny text-color-body-text">Google Drive</div>
          </div>
          <div className="background-secondary-2 rounded-large flex-column-centered padding-4">
            <img src={dropBox} loading="lazy" width="120" alt="" />
            <div className="text-tiny text-color-body-text">Google Drive</div>
          </div>
          <div className="background-secondary-2 rounded-large flex-column-centered padding-4">
            <img src={driveUpload} loading="lazy" width="120" alt="" />
            <div className="text-tiny">Google Drive</div>
          </div>
        </div>
      </div>
      {/* Close button for the modal displayed as a circular icon */}
      <div className="margin-left-6 rounded-full background-color-white box-shadow-large">
        <img src={nav} loading="lazy" alt="" className="padding-4" />
      </div>
    </div>
  );
};
export default UploadFileModal;
