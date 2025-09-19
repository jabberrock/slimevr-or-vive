import './App.css'
import FBTTable from './fbt/FBTTable'
import { SlimeVR } from './fbt/SlimeVR'
import { HTCVive30 } from './fbt/HTCVive30'
import { HTCViveUltimate } from './fbt/HTCViveUltimate';

function App() {
    const choices = [
        {
            system: SlimeVR,
            config: "6_trackers"
        },
        {
            system: HTCVive30,
            config: "3_trackers"
        },
        {
            system: HTCViveUltimate,
            config: "3_trackers"
        },
    ];

    return (
        <>
            <FBTTable initialChoices={choices} />
        </>
    )
}

export default App
