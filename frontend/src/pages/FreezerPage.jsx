import React from 'react';
import {useParams} from "react-router-dom";
import FreezerResult from "../components/FreezerResult";

const FreezerPage = () => {
    const {freezerNumber} = useParams(); // Get URL parameter
    return <FreezerResult freezerNumber={freezerNumber}/>;
};

export default FreezerPage;
