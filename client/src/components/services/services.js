import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./index.scss";

const Services = () => {

    const [services, setServices] = useState([]);

    useEffect(() => {
        axios({
            method: "GET",
            url: "http://localhost:5000/api/service",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            },
        }).then(data => {
            if (data.status === 200) {
                setServices(data.data)
            }
        }).catch(err => {
            if (err.response) {
                console.log(err.response);
            }
        })

    }, [services])

    return (
        <div>
            Admin services
        </div>
    );
};

export default Services;

Services.defaultProps = {
    services: [
        
    ]
}