import { Box, Grow, MenuItem } from "@mui/material";
import { TransitionGroup } from "react-transition-group";
import React from "react";
import { MenuButton } from "../../misc/menuButton";
import { generatePlayerPathById } from "../../gameRecords/routeUtils";
import { useStarPlayer } from "./starPlayerProvider";
import { ArrowDropDown, Star } from "@mui/icons-material";
import { Level } from "../../../data/types";
import { LinkBehavior } from "../../misc/linkBehavior";
import { useTranslation } from "react-i18next";

const StarredPlayerMenu = React.memo(function () {
  useTranslation();
  const { starredPlayers } = useStarPlayer();
  return (
    <TransitionGroup>
      {starredPlayers.length
        ? [
            <Grow key={1}>
              <Box>
                <MenuButton
                  label={<Star />}
                  endIcon={<ArrowDropDown />}
                  sx={{ ".MuiButton-endIcon": { marginLeft: 0 } }}
                >
                  {starredPlayers.map((p) => (
                    <MenuItem key={p.id} href={generatePlayerPathById(p.id)} component={LinkBehavior}>
                      [{new Level(p.levelId).getTag()}] {p.name}
                    </MenuItem>
                  ))}
                </MenuButton>
              </Box>
            </Grow>,
          ]
        : []}
    </TransitionGroup>
  );
});
export default StarredPlayerMenu;
