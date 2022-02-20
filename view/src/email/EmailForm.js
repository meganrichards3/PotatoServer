import "./EmailForm.css"
import { useEffect, useState, Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  filterAllRoutes,
  filterAllSchools,
  sendGeneralAnnouncementToAll,
  sendGeneralAnnouncementToUsersFromSchool,
  sendGeneralAnnouncementToUsersOnRoute,
} from "../api/axios_wrapper";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { Radio } from "@mui/material";
import { FormControlLabel } from "@mui/material";
import { FormControl, InputLabel, Select, MenuItem, CustomSelect, StyledOption} from "@mui/material";
import SelectUnstyled from '@mui/base/SelectUnstyled';


export const EmailForm = () => {
  const action_text = "Send Email";
  const [emailType, setEmailType] = useState("");

  const [message, setMessage] = useState({}); // keys = subject, body

  // school filter
  const [filteredDataSchool, setFilteredDataSchool] = useState([]);
  const [schoolFilter, setSchoolFilter] = useState("");
  const [selectedSchool, setSelectedSchool] = useState();

  // route filter
  const [filteredDataRoute, setFilteredDataRoute] = useState([]);
  const [routeFilter, setRouteFilter] = useState("");
  const [selectedRoute, setSelectedRoute] = useState();

  let navigate = useNavigate();

  const validate_entries = () => {
    if (!message.subject || !message.body) {
      return { valid: false, error: "Subject and Body Required" };
    }
    return { valid: true, error: "" };
  };

  const handleEmailFormSubmit = (e) => {
    console.log("submitting!");
    let valid_results = validate_entries();
    if (valid_results.valid) {
      SendEmail(e);
    } else {
      alert(valid_results.error);
    }
  };

  async function SendEmail(e) {
    let form_results = {
      subject: message.subject,
      html: `<p> ${message.body}</p>`,
    };
    console.log(emailType);

    try {
      if (emailType === "school") {
        let id = selectedSchool.uid;
        console.log(id);
        console.log(form_results);
        sendGeneralAnnouncementToUsersFromSchool({
          message: form_results,
          schoolId: id,
        });
      } else if (emailType === "route") {
        let id = selectedRoute.uid;
        console.log(id);
        console.log(form_results);
        sendGeneralAnnouncementToUsersOnRoute({
          message: form_results,
          routeId: id,
        });
      } else {
        console.log(form_results);
        sendGeneralAnnouncementToAll({ message: form_results });
      }
    } catch (error) {
      let message = error.response.data;
      throw alert(message);
    }
    alert("Successfully Sent Email");
  }

  useEffect(() => {
    const fetchFilteredDataSchool = async () => {
      try {
        const fetchedDataSchool = await filterAllSchools({
          page: 0,
          size: 10,
          sort: "name",
          sortDir: "ASC",
          filterType: "",
          filterData: schoolFilter,
        });
        setFilteredDataSchool(fetchedDataSchool.data.schools);
      } catch (error) {
        alert(error.response.data);
      }
    };
    if (schoolFilter) {
      fetchFilteredDataSchool();
    }
  }, [schoolFilter]);

  useEffect(() => {
    const fetchFilteredDataRoute = async () => {
      try {
        const fetchedData = await filterAllRoutes({
          page: 0,
          size: 10,
          sort: "name",
          sortDir: "ASC",
          filterType: "",
          filterData: routeFilter,
        });
        setFilteredDataRoute(fetchedData.data.routes);
        console.log(fetchedData.data);
      } catch (error) {
        alert(error.response.data);
      }
    };
    if (routeFilter) {
      fetchFilteredDataRoute();
    }
  }, [routeFilter]);

  return (
    <div id="content">
      <h1> {action_text} </h1>
      {/* <p> </p>
      <p> </p>
      <p> </p> */}

  
        <label id="input-label" >
            {" "}
            Send Email To:{"     "}
        </label>
        <FormControl style={{minWidth: "10%"}} id = 'input-input' variant = "standard">
        <Select defaultValue={"all"} onChange={(e) => {setEmailType(e.target.value);}} >
            <MenuItem value={"all"}> All Parents </MenuItem>
            <MenuItem value={"school"}>Parents of a Given School </MenuItem>
            <MenuItem value={"route"}>Parents of a Given Route</MenuItem>
        </Select>
                
        </FormControl>

      {emailType == "school" && (
        <Autocomplete
          sx={{
            paddingTop: "15px",
            paddingBottom: "10px",
            // paddingRight: "7%",
            maxWidth: "45%",
            margin: "auto",
          }}
          options={filteredDataSchool}
          freeSolo
          renderInput={(params) => (
            <TextField {...params} label="Select A School" variant="standard" />
          )}
          getOptionLabel={(option) => option.name}
          noOptionsText={"Type to Search"}
          value={selectedSchool}
          onInputChange={(e) => {
            setSchoolFilter(e.target.value);
          }}
          onChange={(_event, newSchool) => {
            console.log(newSchool);
            setSelectedSchool(newSchool);
          }}
        />
      )}

      {emailType == "route" && (
        <Autocomplete
          options={filteredDataRoute}
          freeSolo
          sx={{
            paddingTop: "15px",
            paddingBottom: "10px",
            paddingRight: "7%",
            maxWidth: "50%",
            margin: "auto",
          }}
          renderInput={(params) => (
            <TextField {...params} label=" Select Route " variant="standard" />
          )}
          getOptionLabel={(option) => option.name}
          fullWidth={true}
          noOptionsText={"Type to Search"}
          value={selectedRoute}
          onInputChange={(e) => {
            setRouteFilter(e.target.value);
          }}
          onChange={(_event, newRoute) => {
            console.log(newRoute);
            setSelectedRoute(newRoute);
          }}
        />
      )}
      <div></div>

      <p> </p>
      <p> </p>
      <label id="input-label" for="n">
        {" "}
        Subject Line:{" "}
      </label>
      <input
        id="input-input"
        type="text"
        maxLength="100"
        value={message.subject}
        onChange={(e) => setMessage({ ...message, subject: e.target.value })}
      />
      <p> </p>
      <p> </p>

      <label id="input-label" for="firstName">
        {" "}
        Email Body:{" "}
      </label>
      <textarea
        id="input-input"
        cols = "300"
        maxLength="100"
        value={message.body}
        onChange={(e) => setMessage({ ...message, body: e.target.value })}
      />
      <p> </p>
      <p> </p>
      <button
        className="submitbutton"
        type="button"
        onClick={(e) => {
          handleEmailFormSubmit(e);
        }}
      >
        {" "}
        {action_text}{" "}
      </button>
    </div>
  );
};
