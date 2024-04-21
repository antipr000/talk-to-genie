import React from "react";
import { Icon } from "@blueprintjs/core";

const RoundIcon = ({ icon, onClick }) => {
    return (
        <Icon
            icon={icon}
            onClick={onClick}
            className={onClick && "hover-pointer"}
            style={{ borderRadius: "50%" }}
            size={50}/>
    )
}

export default RoundIcon;