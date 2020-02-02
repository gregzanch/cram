import React from 'react';

export interface SettingsDrawerCheckBoxProps {
  value: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: React.ReactNode;
  description?: React.ReactNode;
}

export default function SettingsDrawerCheckBox(props: SettingsDrawerCheckBoxProps){
  return (
    <div></div>
  )
}