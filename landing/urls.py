from django.urls import path

from . import views


urlpatterns = [
    path('', views.home, name='home'),
    path('showcase/<slug:slug>/', views.showcase_site, name='showcase-site'),
    path('lead/', views.submit_lead, name='submit-lead'),
    path('track/', views.track_event, name='track-event'),
    path('contact-phone/', views.contact_phone, name='contact-phone'),
    path('thanks/', views.thanks, name='thanks'),
    path('noctalia/', views.noctalia, name='noctalia'),
    path('control/', views.admin_dashboard, name='admin-dashboard'),
    path('robots.txt', views.robots_txt, name='robots-txt'),
    path('sitemap.xml', views.sitemap_xml, name='sitemap-xml'),
]
