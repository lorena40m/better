import React, { useState } from "react";
import Image from "next/image";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import {
  AppBar,
  Container,
  FormControl,
  Menu,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import SearchInput from "./SearchInput";
import LogoIcon from "../../assets/images/icon-logo.svg";
import Logo from "../../assets/images/logo.svg";
import { useRouter } from "next/router";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function Header() {
  // const locations = window?.location.href
  // false kr dena
  const [search, setSearch] = useState(true);
  const [language, setLanguage] = useState("en");
  // const [location, setLocation] = useState(`${locations}`);
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenu = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const router = useRouter();

  const onToggleLanguageClick = (newLocale: any) => {
    console.log(newLocale, "THIS IS");
    const { pathname, asPath, query } = router;
    // setLanguage(e.target.value)
    router.push({ pathname, query }, router.asPath, { locale: newLocale });
  };

  // if (location === "/") {
  //   debugger;
  //   window.location.href;
  //   console.log("true");
  // }
  const { t } = useTranslation("common");

  const changeTo = router.locale === "en" ? "fn" : "en";
  return (
    <AppBar
      position="static"
      className="siteHeader"
      style={{ background: "transparent", border: "none", boxShadow: "none" }}
    >
      <Container maxWidth="xl">
        <Toolbar className="siteHeader-inner">
          <Box
            display={"flex"}
            alignItems={"center"}
            fontStyle={{ gap: "15px" }}
          >
            <Image
              priority
              src={LogoIcon}
              height={36}
              width={36}
              alt="LogoIcon"
            />
            <Image
              className="TabNone"
              priority
              src={Logo}
              height={35}
              width={150}
              alt="Logo"
            />
          </Box>
          {search && (
            <Box>
              <SearchInput />
            </Box>
          )}
          <div>
            <Box sx={{ flexGrow: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Stack>
                  <Box>
                    <Typography variant="body1" style={{ color: "black" }}>
                      Besoin d’aide
                    </Typography>
                    {/* <Typography variant="body2" style={{ color: "#839BBB" }}>
                      changer la langue
                    </Typography> */}
                  </Box>

                  <FormControl sx={{ minWidth: 150 }} size="small">
                    <Select
                      labelId="demo-select-small"
                      id="demo-select-small"
                      className="selectBox"
                      value={language}
                      onChange={(e) => {

                        onToggleLanguageClick(changeTo)
                        setLanguage(e.target.value)
                      }}
                    >
                      <MenuItem value={"en"}>
                        {/* <Link href="/" locale={changeTo}> */}
                          English
                        {/* </Link> */}
                      </MenuItem>
                      <MenuItem value={"fn"}>
                        {/* <Link href="/" locale={changeTo}> */}
                          French
                        {/* </Link> */}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
                {/* <Box color={"black"}>
                  <KeyboardArrowDownIcon />
                </Box> */}
              </Box>
            </Box>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>Profile</MenuItem>
              <MenuItem onClick={handleClose}>My account</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
