import React from 'react';
import { Tooltip, IconButton } from '@mui/material';
import { Info as InfoIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';

interface FormFieldStatusProps {
  isExistingData: boolean;
  fieldName: string;
  value: number | string;
  show?: boolean;
}

const FormFieldStatus: React.FC<FormFieldStatusProps> = ({ 
  isExistingData, 
  fieldName, 
  value,
  show = true 
}) => {
  if (!show || (isExistingData && (value === 0 || value === ''))) {
    return null;
  }

  return (
    <Tooltip
      title={
        isExistingData 
          ? `Pre-filled from existing entry for ${fieldName}`
          : `New entry field for ${fieldName}`
      }
      arrow
    >
      <IconButton size="small" sx={{ ml: 1, p: 0.5 }}>
        {isExistingData ? (
          <InfoIcon 
            fontSize="small" 
            color="info"
            sx={{ opacity: 0.6 }}
          />
        ) : (
          <AddIcon 
            fontSize="small" 
            color="success"
            sx={{ opacity: 0.6 }}
          />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default FormFieldStatus;