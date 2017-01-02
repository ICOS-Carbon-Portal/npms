#ICOS Carbon Portal Toaster package

##Description
React toaster component. It displays a toaster in upper right corner with Info, Success, Warning or Error Bootstrap styling. Bootstrap 3 CSS is required for correct styling.

##Installation
`npm install icos-cp-toaster`

##Properties to send
`autoCloseDelay - Number of ms to wait until automatically close the toast. If not provided, toast stays open until manually closed.`

`fadeInTime - Number of ms the toast spends on fading in. Defaults to 100.`

`fadeOutTime - Number of ms the toast spends on fading out. Defaults to 400.`

`toasterData - Object containing payload for toaster. Ex: new ToasterData(TOAST_INFO, "Information text")`

`maxWidth - Max width in pixels for toast.`

##Tests
None