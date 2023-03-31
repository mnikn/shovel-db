import { Box, Container } from "@mui/material";
import React from "react";
import { UUID } from "../../../utils/uuid";
import { buildFileTree } from "../../models/explorer";
import ExplorerSidebar from "./components/explorer";

export default function Editor() {
  return (
    <Box>
      <ExplorerSidebar />
    </Box>
  );
}
