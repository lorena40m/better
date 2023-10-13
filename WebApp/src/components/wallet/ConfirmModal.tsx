import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Link } from "@mui/material";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: 2,
};

export default function ConfirmModal({ open, close }: any) {
  return (
    <Modal
      open={open}
      onClose={close}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Box>
          <ErrorOutlineIcon />
        </Box>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          Attention : ces jetons sont non-reconnus en peuvent être des arnaques.
          À utiliser avec grande précaution. À vos risques et périls.
        </Typography>
        <Button variant="contained" onClick={close}>
          Oui jactive
        </Button>
        <Link href="#">Non je reste en sécurité</Link>
      </Box>
    </Modal>
  );
}
