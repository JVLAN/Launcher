import { Box, Tab, Tabs } from '@mui/material'
import './App.css'
import { useEffect, useState } from 'react'

// Fonts
import '@fontsource/roboto/500.css'

// Components
import LaunchSection from './components/LaunchSection'
import PopUp from './components/popUp'
import NewsMenu from './components/NewsMenu'
import ServersMenu from './components/ServersMenu'
import SettingsMenu from './components/SettingsMenu'
import Playtime from './components/Playtime'

// states
import { useGameState } from './states/gameState'
import { useSelectedServerState } from './states/selectedServerState'
import { useUIState } from './states/uiState'

// Images
import LogoImage from './images/logo.png'
import axios from 'axios'

const boxes = { height: '97vh' }
const links = {
  fontSize: '20px',
  color: 'white',
  textDecoration: 'none',
  width: 'fit-content',
  fontFamily: 'Azbuka',
  fontWeight: 'bold',
  cursor: 'pointer'
}

function App(): JSX.Element {
  const [tab, setTab] = useState(1)
  const [background, setBackground] = useState(0)
  const [backgrounds, setBackgrounds] = useState<string[]>([])

  const { fetchPublicServers } = useGameState()
  const { currServer, currServerName, currServerType } = useSelectedServerState()
  const { setPopUpState } = useUIState()

  useEffect(() => {
    axios.get('https://cdn.kocity.xyz/launcher/assets/options.json').then((res) => {
      console.log(res.data)
      const data = res.data as {
        activeBackgrounds: string[]
      }

      axios
        .get(`${data.activeBackgrounds[localStorage.getItem('premium') || '0']}/manifest`)
        .then((res) => {
          const backgroundList = res.data.split('\n')
          let backgrounds: string[] = []

          console.log(backgroundList)

          backgroundList.forEach((background: string) => {
            backgrounds.push(
              `${data.activeBackgrounds[localStorage.getItem('premium') || '0']}/${background}`
            )
          })

          backgrounds = ((): string[] => {
            const array: string[] = []
            // randomize backgrounds array
            while (backgrounds.length > 0) {
              const index = Math.floor(Math.random() * backgrounds.length)
              array.push(backgrounds[index])
              backgrounds.splice(index, 1)
            }

            return array
          })()

          console.log(backgrounds)

          setBackgrounds(backgrounds)
        })
    })
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setBackground((background + 1) % backgrounds.length)
    }, 15000)
    return () => clearInterval(interval)
  })

  useEffect(() => {
    if (!currServer || !currServerName || !currServerType) return
    localStorage.setItem('currServer', currServer)
    localStorage.setItem('currServerName', currServerName)
    localStorage.setItem('currServerType', currServerType)
  }, [currServer]) // eslint-disable-line

  useEffect(() => {
    setInterval(fetchPublicServers, 1000 * 60 * 3)
    fetchPublicServers()
  }, [])

  useEffect(() => {
    if (!localStorage.getItem('usernamePrompted')) {
      const defaultName = window.getSystemUsername()
      const field = document.getElementById('usernameField') as HTMLInputElement
      if (field) field.value = defaultName
      setPopUpState('usernamePrompt')
    }
  }, [])

  return (
    <div className="App">
      <Playtime />
      <Box style={{ position: 'absolute' }}>
        <PopUp />
      </Box>
      {backgrounds.map((img, index) => (
        <img
          key={index}
          src={img}
          alt="bgImg"
          className="bgImg"
          style={{
            opacity: index === background ? 1 : 0,
            zIndex: index === background ? -2 : -1,
            transition: 'opacity ease-in-out 2s',
            animation:
              index === background ||
              index === background - 1 ||
              (background === 0 && index === backgrounds.length - 1)
                ? index % 2 === 0
                  ? 'slideL 25s ease-out infinite'
                  : 'slideR 25s ease-out infinite'
                : 'none'
          }}
        />
      ))}

      <Box style={boxes}>
        <Box>
          <img src={LogoImage} alt="logo" style={{ width: '300px', marginLeft: '35px' }} />
        </Box>
        <Box
          style={{
            marginTop: '20px',
            marginLeft: '50px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <a
            style={links}
            className="hoverLink"
            onClick={(): void => {
              window.launchURL('https://kocity.xyz')
            }}
          >
            XYZ WEBSITE
          </a>{' '}
          {/* eslint-disable-line */}
          <a
            style={links}
            className="hoverLink"
            onClick={(): void => {
              window.launchURL('https://github.com/Ipmake/kocitylauncher')
            }}
          >
            GITHUB
          </a>{' '}
          {/* eslint-disable-line */}
          <a
            style={links}
            className="hoverLink"
            onClick={(): void => {
              window.launchURL('https://discord.gg/4kNPb4cRxN')
            }}
          >
            DISCORD
          </a>{' '}
          {/* eslint-disable-line */}
          <a
            style={links}
            className="hoverLink"
            onClick={(): void => {
              window.launchURL('https://www.patreon.com/kocxyz')
            }}
          >
            PATREON
          </a>
        </Box>

        <LaunchSection />
      </Box>

      <Box
        style={{
          background: 'rgba(50, 8, 83, 0.75)',
          padding: '20px',
          marginTop: '-3vh',
          paddingBottom: '0px'
        }}
      >
        <Tabs variant="fullWidth" centered value={tab} onChange={(_e, val): void => setTab(val)}>
          <Tab label="News" />
          <Tab label="Servers" />
          <Tab label="Settings" />
        </Tabs>
        <Box style={{ marginTop: '10px' }}>
          {tab === 0 && <NewsMenu />}
          {tab === 1 && <ServersMenu />}
          {tab === 2 && <SettingsMenu />}
        </Box>
      </Box>
    </div>
  )
}

export default App
