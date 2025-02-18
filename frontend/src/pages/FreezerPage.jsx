import React from 'react';
import {useParams} from "react-router-dom";
import FreezerContent from "../components/FreezerContent";

const FreezerPage = () => {
    const {freezerNumber} = useParams(); // Get URL parameter
    return <FreezerContent freezerNumber={freezerNumber}/>;
};

export default FreezerPage;
