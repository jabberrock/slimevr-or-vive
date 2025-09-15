import './App.css'
import FBTTable from './fbt/FBTTable'
import { SlimeVR } from './fbt/SlimeVR'
import { HTCVive30 } from './fbt/HTCVive30'

function App() {
    const choices = [
        {
            system: SlimeVR,
            config: "6_trackers"
        },
        {
            system: HTCVive30,
            config: "3_trackers"
        }
    ];

    return (
        <>
            <FBTTable choices={choices} />
        </>
    )
}

export default App
