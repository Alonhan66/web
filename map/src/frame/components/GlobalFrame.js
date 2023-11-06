import React, { useContext, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import OsmAndMap from '../../map/components/OsmAndMap';
import MainMenu from '../../menu/MainMenu';
import { Outlet } from 'react-router-dom';
import AppContext from '../../context/AppContext';
import GeneralPanelButtons from './panelbuttons/GeneralPanelButtons';
import { GlobalConfirmationDialog } from '../../dialogs/GlobalConfirmationDialog';
import HeaderMenu from './header/HeaderMenu';
import { useWindowSize } from '../../util/hooks/useWindowSize';
import Alert from './Alert';

const GlobalFrame = () => {
    const ctx = useContext(AppContext);

    const [showInfoBlock, setShowInfoBlock] = useState(false);
    const [clearState, setClearState] = useState(false);
    const [openMainMenu, setOpenMainMenu] = useState(false);
    const [menuInfo, setMenuInfo] = useState(null);
    const [width] = useWindowSize();

    const MAIN_MENU_MIN_SIZE = '64px';
    const MAIN_MENU_SIZE = openMainMenu ? '240px' : MAIN_MENU_MIN_SIZE;
    const MENU_INFO_SIZE = menuInfo ? '424px' : '0px';

    useEffect(() => {
        ctx.setInfoBlockWidth(MENU_INFO_SIZE);
    });

    return (
        <Box sx={{ display: 'flex' }}>
            <HeaderMenu />
            <Box
                sx={{
                    width: { xs: `calc(100%)` },
                    mr: ctx.infoBlockWidth,
                }}
            >
                <GlobalConfirmationDialog />
                <OsmAndMap mainMenuWidth={MAIN_MENU_MIN_SIZE} menuInfoWidth={MENU_INFO_SIZE} />
                <Alert width={width} />
                <GeneralPanelButtons
                    mainMenuWidth={MAIN_MENU_MIN_SIZE}
                    menuInfoWidth={MENU_INFO_SIZE}
                    showInfoBlock={showInfoBlock}
                    setShowInfoBlock={setShowInfoBlock}
                    clearState={clearState}
                    menuInfo={menuInfo}
                    setMenuInfo={setMenuInfo}
                />
            </Box>
            <MainMenu
                size={MAIN_MENU_SIZE}
                infoSize={MENU_INFO_SIZE}
                openMainMenu={openMainMenu}
                setOpenMainMenu={setOpenMainMenu}
                menuInfo={menuInfo}
                setMenuInfo={setMenuInfo}
                showInfoBlock={showInfoBlock}
                setShowInfoBlock={setShowInfoBlock}
                setClearState={setClearState}
            />
            <Outlet />
        </Box>
    );
};

export default GlobalFrame;
