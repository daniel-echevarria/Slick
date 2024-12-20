import "./DirectMessages.css";
import newMsgIcon from "../../../assets/icons/new-msg.svg";
import { createContext, useEffect, useState } from "react";
import Conversation from "./Conversation/Conversation";
const apiUrl = import.meta.env.VITE_API_URL;

export const InterlocutorContext = createContext(null);

const DirectMessages = ({ profiles }) => {
  const [friendship, setFriendship] = useState(null);
  const [interlocutor, setInterlocutor] = useState(null);

  useEffect(() => {
    const getFriendship = async () => {
      if (!interlocutor) return;
      try {
        const response = await fetch(`${apiUrl}/friendships`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: sessionStorage.getItem("token"),
          },
          body: JSON.stringify({ contact_id: interlocutor.user_id }),
        });
        if (response.ok) {
          const result = await response.json();
          setFriendship(result);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getFriendship();
  }, [interlocutor]);

  const selectInterlocutor = (e) => {
    const selectedId = Number(e.target.value);
    const selectedProfile = profiles.find(
      (profile) => profile.id == selectedId
    );
    setInterlocutor(selectedProfile);
  };

  const profilesList = profiles.map((profile) => {
    return (
      <div key={profile.id} className="user">
        <button onClick={selectInterlocutor} value={profile.id}>
          <img src={profile.avatar} className="avatar-img" />
          {profile.display_name || profile.name || profile.email}
        </button>
      </div>
    );
  });

  const removeInterlocutor = () => {
    setInterlocutor(null);
    setFriendship(null);
  };

  return (
    <InterlocutorContext.Provider
      value={{ interlocutor: interlocutor, setter: selectInterlocutor }}
    >
      <div className="direct-messages">
        <div className="dm-header">
          <h3>Direct Messages</h3>
          <button onClick={removeInterlocutor}>
            <img src={newMsgIcon} alt="new-message-icon" className="icon" />
          </button>
        </div>
        <div className="users-list">{profilesList}</div>
      </div>
      <Conversation
        friendship={friendship}
        profiles={profiles}
        interlocutor={interlocutor}
      />
    </InterlocutorContext.Provider>
  );
};

export default DirectMessages;
