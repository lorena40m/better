import React from "react";
import { styled, alpha } from "@mui/material/styles";
import Image from "next/image";
import searchIcon from "../../assets/iconSvg/searchIconBlack.svg";
import InputBase from "@mui/material/InputBase";
import TuneIcon from "@mui/icons-material/Tune";
import { ChildCare } from "@mui/icons-material";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  // backgroundColor: alpha(theme.palette.common.black, 0.15),
  "&:hover": {
    // backgroundColor: alpha(theme.palette.common.black, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
  backgroundColor: "transparent",
  border: "1px solid #839BBB",
  overflow: "hidden",
  color: "#839BBB",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  paddingLeft: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  right: 0,
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: "9",
  "& svg": {
    color: '#2A3B51',
    padding: '0 10px',
  },
  "& .SearchIconBtn ": {
    height: '100%',
    background: 'rgba(131, 155, 187, 0.6)',
    color: '#fff',
    cursor: 'pointer',
  },
}));
const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 0, 1, 1),
    // vertical padding + font size from searchIcon
    paddingRight: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "100%",
    },
  },
  width: "100%",
}));




const SearchInput = () => {
  return (
    <div className="SearchBox">
      <Search>
        <SearchIconWrapper>
          <Image src={searchIcon} width={30} alt="Research icon" style={{margin: "0 5px"}} />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder="Entrez votre recherche "
          inputProps={{ "aria-label": "search" }}
        />
      </Search>
    </div>
  );
};

export default SearchInput;
