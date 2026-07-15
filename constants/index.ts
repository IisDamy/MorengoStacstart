// fix declaration issue and delete useless shit
import arrowBack from "@/assets/icons/arrow-back.png";
import arrowDown from "@/assets/icons/arrow-down.png";
import arrowRight from "@/assets/icons/arrow-right.png";
import bag from "@/assets/icons/bag.png";
import check from "@/assets/icons/check.png";
import clock from "@/assets/icons/clock.png";
import envelope from "@/assets/icons/envelope.png";
import home from "@/assets/icons/home.png";
import location from "@/assets/icons/location.png";
import logout from "@/assets/icons/logout.png";
import minus from "@/assets/icons/minus.png";
import pencil from "@/assets/icons/pencil.png";
import person from "@/assets/icons/person.png";
import phone from "@/assets/icons/phone.png";
import plus from "@/assets/icons/plus.png";
import search from "@/assets/icons/search.png";
import star from "@/assets/icons/star.png";
import trash from "@/assets/icons/trash.png";
import avatar from "@/assets/images/avatar.png";
import burgerOne from "@/assets/images/burger-one.png";
import burgerTwo from "@/assets/images/burger-two.png";
import coleslaw from "@/assets/images/coleslaw.png";
import emptyState from "@/assets/images/empty-state.png";
import fries from "@/assets/images/fries.png";
import loginGraphic from "@/assets/images/login-graphic.png";
import logo from "@/assets/images/logo.png";
import salad from "@/assets/images/salad.png";
import success from "@/assets/images/success.png";
import tomatoes from "@/assets/images/tomatoes.png";
import sparkle from "@/assets/animations/sparkle.json";
import smiley from "@/assets/animations/smiley.json";
import flower from '@/assets/images/flower.png';
import fruit from '@/assets/images/fruit.png';
import bicycle from '@/assets/images/bicycle.png';
import vine1 from '@/assets/images/vines-1.png';
import vine2 from '@/assets/images/vine-2.png';
import plate from '@/assets/images/plate2.png';
import milkshake from '@/assets/images/milkshake.png';
import morengologo from '@/assets/icons/morengologo.png';
import openedBook from '@/assets/images/openedbook.png';
import sodaCup from '@/assets/images/sodacup.png';
import bubbleStar from '@/assets/images/bubblestars.png';
import bubbles2 from '@/assets/images/bubbles2.png';
import bubbles from '@/assets/images/bubbles.png';
import stars1 from '@/assets/images/stars1.png';
import moonstars from '@/assets/images/moonstars.png';
import flower2 from '@/assets/images/flower2.png';
import book from '@/assets/images/book.png';
import profile from '@/assets/icons/profile.png';
import target from '@/assets/icons/target.png'
import customdelivery from '@/assets/images/customdelivery.jpg';
import womaneatschicken from '@/assets/images/womaneatschicken.jpg';
import businesslady from '@/assets/images/businesslady.jpg';
import guywithdrink from '@/assets/images/guywithdrink.jpg';
import cartoonArrow from '@/assets/images/cartoon-arrow.png'
import allsorts from '@/assets/images/allsorts.png';
import fastDelivery from '@/assets/icons/fast-delivery.png'
import maskRectangle from '@/assets/images/mask-rectangle.png'
import connectingRider from '@/assets/videos/connecting-rider.mp4'

export const CATEGORIES = [
    {
        id: "1",
        name: "All",
    },
    {
        id: "2",
        name: "Burger",
    },
    {
        id: "3",
        name: "Pizza",
    },
    {
        id: "4",
        name: "Wrap",
    },
    {
        id: "5",
        name: "Burrito",
    },
];

export const TabGrouping = [
    'Recent', 'Favorite','Rating','Popular'
]

export const offers = [
    {
        id: 1,
        title: "SUMMER COMBO",
        image: burgerOne,
        color: "#D33B0D",
    },
    {
        id: 2,
        title: "BURGER BASH",
        image: burgerTwo,
        color: "#DF5A0C",
    },
];

export const sides = [
    {
        name: "Fries",
        image: fries,
        price: 3.5,
    },
    {
        name: "Coleslaw",
        image: coleslaw,
        price: 2.5,
    },
    {
        name: "Salad",
        image: salad,
        price: 4.5,
    },
];

export const toppings = [
    {
        name: "Tomatoes",
        image: tomatoes,
        price: 0.7,
    },
];

export const color = {
    dashboard: '#e2f2f8c2',
    morange: '#fc7323',
    moregreen: '#57a886'
}

export const animations = {
    sparkle,
    smiley,
    connectingRider
}

export const images = {
    avatar,
    burgerOne,
    burgerTwo,
    coleslaw,
    emptyState,
    loginGraphic,
    logo,
    salad,
    success,
    tomatoes,
    arrowBack,
    womaneatschicken,
    businesslady,
    arrowDown,
    arrowRight,
    bag,
    check,
    clock,
    envelope,
    home,
    location,
    logout,
    minus,
    pencil,
    person,
    phone,
    plus,
    search,
    star,
    trash,
    vine1,
    vine2,
    flower,
    plate,
    milkshake,
    fruit,
    bicycle,
    morengologo,
    openedBook,
    sodaCup,
    bubbleStar,
    bubbles,
    bubbles2,
    stars1,
    moonstars,
    flower2,
    book,
    profile,
    target,
    customdelivery,
    guywithdrink,
    cartoonArrow,
    allsorts,
    fastDelivery,
    maskRectangle
    
};





export const universities = [
  { name: "Abubakar Tafawa Balewa University", coords: [10.2797, 9.7792] },
  { name: "Abia State University", coords: [5.8270, 7.3968] },
  { name: "Adekunle Ajasin University", coords: [7.4667, 5.7333] },
  { name: "Ahmadu Bello University", coords: [11.0667, 7.7000] },
  { name: "Afe Babalola University", coords: [7.6333, 5.2167] },
  { name: "Akwa Ibom State University", coords: [4.6377, 7.6203] },
  { name: "Ambrose Alli University", coords: [6.7430, 6.1350] },
  { name: "Auchi Polytechnic", coords: [7.0833, 6.2667] },
  { name: "Babcock University", coords: [6.9333, 3.9667] },
  { name: "Bauchi State University", coords: [11.8330, 9.9500] },
  { name: "Bayero University", coords: [12.0000, 8.5167] },
  { name: "Baze University", coords: [9.0600, 7.4700] },
  { name: "Benue State University", coords: [7.7333, 8.5333] },
  { name: "Bowen University", coords: [7.6333, 4.1833] },
  { name: "Covenant University", coords: [6.6667, 3.3500] },
  { name: "Delta State University", coords: [5.7833, 6.1000] },
  { name: "Ekiti State University", coords: [7.6519, 5.2210] },
  { name: "Enugu State University of Science and Technology", coords: [6.4500, 7.5000] },
  { name: "Federal Polytechnic Bida", coords: [9.0833, 6.0167] },
  { name: "Federal Polytechnic Ilaro", coords: [6.8833, 3.0167] },
  { name: "Federal University of Agriculture, Abeokuta", coords: [7.1500, 3.3500] },
  { name: "Federal University of Agriculture, Makurdi", coords: [7.7410, 8.5350] },
  { name: "Federal University of Petroleum Resources", coords: [5.5500, 5.7833] },
  { name: "Federal University of Technology, Akure", coords: [7.2571, 5.1992] },
  { name: "Federal University of Technology, Minna", coords: [9.5300, 6.4500] },
  { name: "Gombe State University", coords: [10.2833, 11.1667] },
  { name: "Ibrahim Badamasi Babangida University", coords: [8.8667, 6.5667] },
  { name: "Igbinedion University", coords: [6.7500, 5.0000] },
  { name: "Imo State University", coords: [5.4833, 7.0333] },
  { name: "Kaduna State University", coords: [10.5167, 7.4167] },
  { name: "Kano University of Science and Technology", coords: [11.7500, 8.8500] },
  { name: "Kebbi State University of Science and Technology", coords: [12.2833, 4.4667] },
  { name: "Kogi State University", coords: [7.7500, 7.4833] },
  { name: "Kwara State University", coords: [8.7000, 4.6667] },
  { name: "Ladoke Akintola University of Technology", coords: [8.1333, 4.2500] },
  { name: "Lagos State University", coords: [6.4670, 3.1870] },
  { name: "Landmark University", coords: [8.1500, 5.1000] },
  { name: "Lead City University", coords: [7.3833, 3.8833] },
  { name: "Madonna University", coords: [5.1000, 6.8000] },
  { name: "Michael Okpara University of Agriculture", coords: [5.4833, 7.5500] },
  { name: "Modibbo Adama University", coords: [9.2333, 12.5000] },
  { name: "Nasarawa State University", coords: [8.8500, 7.8667] },
  { name: "Niger Delta University", coords: [4.8500, 6.4167] },
  { name: "Nnamdi Azikiwe University", coords: [6.2000, 7.0667] },
  { name: "Obafemi Awolowo University", coords: [7.4833, 4.5500] },
  { name: "Olabisi Onabanjo University", coords: [6.9833, 3.9167] },
  { name: "Ondo State University of Science and Technology", coords: [6.5000, 4.7833] },
  { name: "Osun State University", coords: [7.7667, 4.5500] },
  { name: "Pan-Atlantic University", coords: [6.4500, 3.7500] },
  { name: "Plateau State University", coords: [9.3000, 8.9500] },
  { name: "Redeemer's University", coords: [7.7333, 4.4333] },
  { name: "Rivers State University", coords: [4.7500, 7.0000] },
  { name: "Sokoto State University", coords: [13.0500, 5.2333] },
  { name: "Taraba State University", coords: [8.8833, 11.3500] },
  { name: "Umaru Musa Yar'Adua University", coords: [12.9833, 7.6000] },
  { name: "University of Abuja", coords: [8.9833, 7.2000] },
  { name: "University of Benin", coords: [6.3333, 5.6167] },
  { name: "University of Calabar", coords: [4.9667, 8.3333] },
  { name: "University of Ibadan", coords: [7.4333, 3.9000] },
  { name: "University of Ilorin", coords: [8.5000, 4.5500] },
  { name: "University of Jos", coords: [9.9333, 8.9000] },
  { name: "University of Lagos", coords: [6.5160, 3.4160] },
  { name: "University of Maiduguri", coords: [11.8333, 13.1500] },
  { name: "University of Nigeria (Nsukka)", coords: [6.8612, 7.3967] },
  { name: "University of Port Harcourt", coords: [4.8167, 6.9167] },
  { name: "University of Uyo", coords: [5.0500, 7.9333] },
  { name: "Yaba College of Technology", coords: [6.5000, 3.3833] }
];