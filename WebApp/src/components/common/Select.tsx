import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import MuiSelect, { SelectChangeEvent } from '@mui/material/Select'
import { useTranslation } from 'next-i18next'
import * as React from 'react'

export default function Select({ onChange, values, labels, defaultValue }) {
  const { t } = useTranslation('common')
  const [value, setValue] = React.useState(defaultValue ?? values[0])

  return (
    <FormControl sx={{ minWidth: 150 }}>
      <MuiSelect
        className="selectBox"
        value={value}
        onChange={(event: SelectChangeEvent) => {
          setValue(event.target.value)
          onChange?.(event.target.value)
        }}
      >
        {values.map((value, i) => (
          <MenuItem key={value} value={value}>
            {labels[i]}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  )
}
