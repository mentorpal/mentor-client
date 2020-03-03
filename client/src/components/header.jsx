import React from "react";
import { useSelector } from "react-redux";

const Header = () => {
  const mentor = useSelector(state => state.mentorsById[state.curMentor]);

  return (
    <div id="header">
      {mentor ? `${mentor.name}: ${mentor.title}` : undefined}
    </div>
  );
};

export default Header;
