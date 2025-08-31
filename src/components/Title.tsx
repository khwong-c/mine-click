import picTitle from '../images/title.png';

export function Title() {
    return <div
        className="w-screen h-fit p-1 absolute"
    >
        <center>
            <img
                src={picTitle}
                style={{
                    width: "60vw",
                }}
                alt="Title"
                draggable="false"/>
        </center>
    </div>;
}