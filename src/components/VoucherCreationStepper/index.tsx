import {
  Box,
  Button,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { VoucherCreationProvider, useVoucherCreation } from "./Context";
import { StepContent } from "./Steps";

function CreationStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const { voucherData } = useVoucherCreation();
  const steps = [
    "Intro",
    "About You",
    "Name and Products",
    "Value and Supply",
    "Expiration",
    "Other Options",
    "Signing and Publishing",
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  const handleReset = () => {
    setActiveStep(0);
  };
  return (
    <Box sx={{ p: 2 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <div>
        {activeStep === steps.length ? (
          <div>
            <Typography>Process Completed</Typography>
            <Button onClick={handleReset}>Reset</Button>
          </div>
        ) : (
          <div>
            <StepContent stepIndex={activeStep} />
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            <Button variant="contained" color="primary" onClick={handleNext}>
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </div>
        )}
      </div>
      {JSON.stringify(voucherData)}
    </Box>
  );
}

export const VoucherCreationStepper = () => {
  return (
    <VoucherCreationProvider>
      <CreationStepper />
    </VoucherCreationProvider>
  );
};
