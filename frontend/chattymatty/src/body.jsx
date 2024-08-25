import { useEffect } from 'react';
import styled from 'styled-components';

const ParentContainer = styled.div`
display:flex;
gap:30px;
`

const Sidebar = styled.div`
width:22%;
height:auto;
background-color:pink;
`

const BodySection = styled.div`
min-width:40%;
// height:100vh;
// background-color:crimson;

`

const SidebarList = styled.div`
display:flex;
flex-direction:column;
`

// const FormInput = styled.form.input`
// background-color:green;
// `
const MainBody = () => {

    useEffect(() => {
        console.log("useEffect Jani")

        fetch(`http://localhost:3800/socialBee/getAll`).then
        (response => response.json())
        .then(posts => console.log("posts: ", posts))
        .catch(err => console.log("this is the Error: ", err))
    }, [])

    return (
        <ParentContainer>
            <Sidebar>
                <h2> Sidebar </h2>
                <SidebarList>
                    <a href="#"> <li>Great</li></a>
                    <a href="#"> <li> HowMuch</li> </a>
                    <a href="#"> <li> Giving All</li> </a>
                    <a href="#"> <li>MassiveAction</li></a>
                    <a href="#"> <li> Privilege</li> </a>
                    <a href="#"> <li> hallMark</li> </a>
                </SidebarList>
            </Sidebar>
            <BodySection>
                <h2> Center Section </h2>
                <div className='card'>
                    <form method="post" id="myForm">
                        {/* <FormInput type="text" id="text" placeholder="Share YourSelf" /> */}
                    </form>


                </div>
            </BodySection>

            <div className="Sidebar">
                <h2> RightBar </h2>
            </div>
        </ParentContainer>
    )
}

export default MainBody;