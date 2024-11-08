import "./ConversationHeader.css";
import CustomInput from "../../../../CustomInput/CustomInput";
import SelectInterlocutorDropDown from "./SelectInterlocutorDropdown/SelectInterlocutorDropDown";
import { useContext } from "react";
import { InterlocutorContext } from "../../DirectMessages";
import { ProfileContext } from "../../../HomePage";

const ConversationHeader = ({ profiles }) => {
  const interlocutorProfile = useContext(InterlocutorContext).interlocutor;
  const profileContext = useContext(ProfileContext);

  const handleProfileClick = (e) => {
    console.log(e.target.value);
    profileContext.handleProfileClick(e);
  };

  return (
    <div className="conversation-header">
      {interlocutorProfile ? (
        <button
          className="interlocutor-btn"
          value={interlocutorProfile.id}
          onClick={handleProfileClick}
        >
          <img src={interlocutorProfile.avatar} alt="" className="avatar-img" />
          {interlocutorProfile.display_name ||
            interlocutorProfile.name ||
            interlocutorProfile.email}
        </button>
      ) : (
        <div className="new-msg-header">
          <span>New Message</span>
          <div className="new-msg-interlocutor">
            <SelectInterlocutorDropDown items={profiles} />
            <span>To:</span>
            <CustomInput id={"new-msg-interlocutor-input"} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationHeader;
