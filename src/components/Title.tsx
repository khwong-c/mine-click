import picTitle from '../images/title.png';
import {useMediaQuery} from "usehooks-ts";

export function Title() {
    const isPhone = useMediaQuery("only screen and (max-width : 481px)");
    return <div
        className="w-screen h-fit p-1 absolute"
    >
        <center>
            <img
                src={picTitle}
                style={{
                    width: isPhone ? "80vw" : "60vw",
                }}
                alt="Title"
                draggable="false"/>
        </center>
    </div>;
}