console.log('Labas slideshow!');

let slideIndex = 1;
let slideTimer; // čia saugosim timeout'ą

showSlides(slideIndex);

// rankinis perjungimas
function plusSlides(n) {
    showSlides(slideIndex += n);
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    let dots = document.getElementsByClassName("dot");

    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }

    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active";

    // išvalom seną laikmatį, kad nesidubliuotų
    clearTimeout(slideTimer);

    // automatinis perėjimas kas 3 sek.
    slideTimer = setTimeout(() => {
        showSlides(slideIndex += 1);
    }, 3000);
}

// sustabdyti automatinį slinkimą
function stopSlides() {
    clearTimeout(slideTimer);
}

// tęsti automatinį slinkimą
function startSlides() {
    slideTimer = setTimeout(() => {
        showSlides(slideIndex += 1);
    }, 3000);
}

// „hover pause“ – kai užvedi ant skaidrių konteinerio
const container = document.querySelector(".slideshow-container");

container.addEventListener("mouseenter", stopSlides);
container.addEventListener("mouseleave", startSlides);