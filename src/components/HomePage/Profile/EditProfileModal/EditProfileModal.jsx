import CustomInput from "../../../CustomInput/CustomInput";
import "./EditProfileModal.css";
import { useEffect, useRef, useState } from "react";
import { DirectUpload } from "activestorage";
import imageCompression from "browser-image-compression";

const apiUrl = import.meta.env.VITE_API_URL;

const EditProfileModal = ({
  profile,
  open,
  setEditProfileIsOpen,
  setCurrentUserProfile,
}) => {
  const modal = useRef(null);

  const [save, setSave] = useState(false);
  const [fieldValues, setFieldValues] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  useEffect(() => {
    const updateProfileFields = () => {
      setFieldValues({
        name: profile.name || "",
        display_name: profile.display_name || "",
        title: profile.title || "",
        avatar: profile.avatar || "",
      });
    };
    updateProfileFields();
  }, [profile]);

  useEffect(() => {
    if (!save) return;
    const saveChanges = async () => {
      const response = await fetch(`${apiUrl}/profiles/${profile.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fieldValues),
      });
      const result = await response.json();
      if (response.ok) {
        setCurrentUserProfile({ ...result.profile });
        setSave(false);
      } else {
        console.log("problem when updating the profile");
        setSave(false);
      }
    };
    saveChanges();
  }, [save, fieldValues, profile.id, setCurrentUserProfile]);

  useEffect(() => {
    const submitPicture = async () => {
      if (!uploadedFile) return;
      setIsUploadingPicture(true);
      const upload = new DirectUpload(
        uploadedFile,
        `${apiUrl}/rails/active_storage/direct_uploads`
      );
      upload.create(async (error, blob) => {
        if (error) throw new Error(error);
        try {
          const response = await fetch(
            `${apiUrl}/profiles/${profile.id}/update_profile_picture`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ blob_id: blob.signed_id }),
            }
          );
          const result = await response.json();
          if (response.ok) {
            setFieldValues({ ...fieldValues, avatar: result.avatar_url });
            setUploadedFile(null);
          }
        } catch (error) {
          console.log(error.message);
        } finally {
          setIsUploadingPicture(false);
        }
      });
    };
    submitPicture();
  }, [uploadedFile, profile.id, fieldValues]);

  const handleChangeName = (e) => {
    const newName = e.target.value;
    setFieldValues({ ...fieldValues, name: newName });
  };

  const handleChangeDisplayName = (e) => {
    const newName = e.target.value;
    setFieldValues({ ...fieldValues, display_name: newName });
  };
  const handleChangeTitle = (e) => {
    const newTitle = e.target.value;
    setFieldValues({ ...fieldValues, title: newTitle });
  };

  const handleCloseModal = () => {
    modal.current.close();
    setEditProfileIsOpen(false);
  };

  const handleSaveChanges = () => {
    setSave(true);
    handleCloseModal();
  };

  const handleFileUpload = async (e) => {
    try {
      const file = e.target.files[0];

      const options = {
        maxSizeMB: 3,
        maxWidthOrHeight: 500,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);

      setUploadedFile(compressedFile);
    } catch (err) {
      console.log("Error during image resizing:", err);
    }
  };

  open && modal.current.showModal();

  return (
    fieldValues && (
      <dialog className="edit-profile-modal" ref={modal}>
        <h2>Edit your profile</h2>
        <form action="" className="edit-form">
          <div className="name-fields">
            <CustomInput
              label={"Full name"}
              value={fieldValues.name}
              handleChange={handleChangeName}
            />
            <CustomInput
              label={"Display name"}
              value={fieldValues.display_name}
              handleChange={handleChangeDisplayName}
            />
            <CustomInput
              label={"Title"}
              value={fieldValues.title}
              handleChange={handleChangeTitle}
            />
          </div>
          <div className="profile-photo-field">
            <span>Profile photo</span>
            {isUploadingPicture ? (
              <>
                <img src={fieldValues.avatar} className="profile-img loading" />
                <label htmlFor="fileInput" id="update-photo-btn">
                  Loading...
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    id="fileInput"
                  />
                </label>
              </>
            ) : (
              <>
                <img src={fieldValues.avatar} alt="" className="profile-img" />
                <label htmlFor="fileInput" id="update-photo-btn">
                  Upload photo
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    id="fileInput"
                  />
                </label>
              </>
            )}
          </div>
        </form>
        <div className="edit-form-buttons">
          <button onClick={handleCloseModal}>Cancel</button>
          <button className="confirm" onClick={handleSaveChanges}>
            Save Changes
          </button>
        </div>
      </dialog>
    )
  );
};

export default EditProfileModal;
