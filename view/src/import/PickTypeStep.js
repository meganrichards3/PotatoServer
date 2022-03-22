
import { StepButtons } from "./StepButtons"
import { RadioGroup, FormControlLabel, Radio } from "@mui/material"
import { useEffect } from "react";

export const PickTypeStep = ({dataType, setRequiredColumns, setDataType, step_labels, activeStep, setActiveStep, setRunValidation}) => {
    // if going backwards, remember their selection
    useEffect(() => {
        if (dataType) {
            setDataType(dataType)
        }
    }, []);

    return (
        <div>
            <div id = 'question'> Who do you have data for? </div>
            <div id = 'centered-form'> 
                <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    value={dataType}
                    onChange={(e) => {
                        setDataType(e.target.value); 
                        let studentKeys = ['name', 'parent_email', 'school_name', 'student_id', 'index']
                        let parentKeys = ['name', 'email', 'address', 'phone_number']
                        const required = (e.target.value === 'students') ? studentKeys : parentKeys;
                        setRequiredColumns(required)
                    }}
                >
                    <FormControlLabel value="students" control={<Radio />} label="Students" />
                    <FormControlLabel value="parents" control={<Radio />} label="Admin, Staff, or Parents" />
                </RadioGroup>
            </div>
           
             
            <StepButtons
                nextButtonValid = {dataType} 
                step_labels = {step_labels} 
                activeStep = {activeStep} 
                setActiveStep = {setActiveStep}
                setRunValidation = {setRunValidation}
                 > 
            </StepButtons>
        </div>
    )
}