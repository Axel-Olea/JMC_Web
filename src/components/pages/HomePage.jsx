import React from 'react'
import Banner from '../sections/Banner'
import PromoRibbon from '../sections/PromoRibbon/PromoRibbon'
import Chatbot from '../sections/Chatbot'
import WhyUsSection from '../sections/WhyUsSection'
import Header from '../sections/Header/Header'
import Footer from '../sections/Footer'
import ContactSection from '../sections/ContactSection'
import ScheduleSection from '../sections/ScheduleSection'
import TopServices from '../sections/TopServices'
import GalleryCarousel from '../sections/GalleryCarousel'
import AboutUs from '../sections/AboutUs'

export const HomePage = () => {
  return (
     <div>
     <Header/>
      <Banner/>
       <PromoRibbon/>
       <TopServices/>
      <GalleryCarousel/>
      <AboutUs/>
      <WhyUsSection/>
      <ContactSection/>
      <ScheduleSection/>
      {/* <Chatbot/> */}
      <Footer/>
    </div>
  )
}
