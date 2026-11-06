const background = 'gray'
const color = 'blue'


const button = document.createElement("button");
button.innerText = "Click me";
button.style = 'background: ; color: blue ;'

const isAuthorized = true;

button.addEventListener('click', () => {
 if (isAuthorized) { 
  alert('you are authorized');
}

alert('you are not authorized');
});


document.body.appendChild(button);