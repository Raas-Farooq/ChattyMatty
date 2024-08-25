import { useRef } from 'react';
import './navbar.css';


function Navbar() {
  const searchForm = useRef(null);

  const handleOpenSearch = () => {
    if(searchForm.current){
      searchForm.current.classList.toggle('show-search');
      console.log('searchForm after click: ', searchForm.current.classList)
    }
  }
  return (
    <div class="container">
      <nav class="navbar navbar-expand-custom navbar-light bg-light">
        <div class="container-fluid">
          <a class="navbar-brand" href="#">ChattyMatty</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>

          <form class="d-flex" ref={searchForm}>
            <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
            <button class="btn btn-outline-success" type="submit">Search</button>
          </form>
          <button class="btn btn-success" onClick={handleOpenSearch}>Search</button>
        </div>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="listItems">
            <a href="#"> <li>Great</li></a>
            <a href="#"> <li> HowMuch</li> </a>
            <a href="#"> <li> Giving All</li> </a>
          </ul>
        </div>
        
       
      </nav>
    </div>
  );
}

export default Navbar;
