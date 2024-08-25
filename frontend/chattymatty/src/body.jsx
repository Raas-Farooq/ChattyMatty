import { useEffect, useState } from 'react';
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
    const [allPosts, setAllPosts] = useState([]);

    useEffect(() => {
        console.log("useEffect Jani")

        fetch(`http://localhost:3800/socialBee/allData`).then
        (response => response.json())
        .then(posts => {
            console.log("Posts received: ", posts);
            setAllPosts(posts.userPosts);
        })
        .catch(error => console.log("this is the Error: ", error))
    }, [])

    // Extracting the video Id from youtube video links

    function getYouTubeVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
      }


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
                    <iframe 
                    width="200px" 
                    height="200px"
                    src={`https://www.youtube.com/embed/oZRSPsHhCPs`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    > 
                    </iframe>
                    <form method="post" id="myForm">
                        <input type="text" id="text" placeholder="Share YourSelf" />
                    </form>
                </div>
                    <div>
                        {(!allPosts) ?(<h2> Loading Posts..</h2>)
                        :
                        (
                        <div className="postsContainer">
                            {allPosts.map(post => 
                                {
                                return (
                                    <div className="post"> 
                                        <h4> {post.textMessage}</h4>
                                        {post.images && post.images.length ? post.images.map(image => 
                                        <img src={image} alt="image" width="200px" height="200px" />
                                    ): null}

                                        {post.videos && post.videos.length ? post.videos.map(videoUrl => 
                                            <iframe width="200px" height="200px" src={`https://www.youtube.com/embed/${getYouTubeVideoId(videoUrl)}`} allowFullScreen></iframe>
                                        ): null}
                                    </div>
                                )
                                }
                            )}
                        </div>
                        )}
                        
                    </div>

            </BodySection>

            <div className="Sidebar">
                <h2> RightBar </h2>
            </div>
        </ParentContainer>
    )
}

export default MainBody;