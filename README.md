# 🚴 Baguio Cycling Community

A community-driven Progressive Web App (PWA) built to connect cyclists in Baguio City.

The platform serves as a central hub where cyclists can create profiles, manage a private bike registry, discover local cycling events, stay informed through community posts, report road hazards, and quickly alert the community when a bicycle is lost or stolen.

This project is intentionally focused on **Baguio City** for its initial release, with a scalable architecture that can support additional cities in the future.

---

## ✨ Features

### 👤 Cyclist Profiles

* Secure authentication
* Personal profile
* Profile and cover photos
* Cyclist type classification
* Typical daily cycling route
* Social media links

### 🚲 Private Bike Registry

Maintain a private list of owned bicycles.

Each registered bike includes:

* Unique Bike ID
* Nickname
* Brand
* Model
* Year
* Wheel Size
* Frame Size
* Photo
* Notes

Bike information remains private unless the owner reports it as missing.

### 🚨 Missing Bike Alerts

If a bicycle is lost or stolen, the owner can immediately mark it as **Missing**.

The system automatically:

* Creates a Missing Bike record
* Publishes the alert to the Community Feed
* Allows additional photos
* Tracks recovery status
* Enables community comments and possible sightings

### 📅 Community Events

Create and discover cycling events.

Features include:

* Event details
* Meeting location
* Date & time
* Ride difficulty
* Estimated distance
* Elevation
* Pace
* RSVP system
* Participant approval

### 📢 Community Feed

A chronological feed where members can:

* Share updates
* Upload photos
* Like posts
* Comment
* View automatic announcements for:

  * New events
  * Missing bike alerts
  * Community notices

### ⚠️ Road Hazard Reporting

Help improve cycling safety by reporting hazards such as:

* Potholes
* Open manholes
* Broken glass
* Flooding
* Landslides
* Road construction
* Other hazards

Community members can confirm when hazards have been resolved.

### 🔍 Search

Search for:

* Cyclists
* Events
* Active Missing Bikes

### 🛠 Admin Dashboard

Administrators can:

* Manage users
* Moderate posts
* Moderate events
* Moderate hazard reports
* Moderate missing bike reports
* Remove spam and inappropriate content

---

# 🏗 Technology Stack

## Frontend

* Next.js 15
* React
* TypeScript
* Tailwind CSS
* shadcn/ui

## Backend

* Supabase
* PostgreSQL
* Supabase Authentication
* Supabase Storage
* Row Level Security (RLS)

## Additional Libraries

* React Hook Form
* Zod
* TanStack Query

## Deployment

* Vercel

---

# 📁 Project Structure

```text
app/
features/
  auth/
  profile/
  bikes/
  events/
  feed/
  hazards/
  missing-bikes/
  admin/
components/
hooks/
lib/
services/
types/
```

---

# 🔐 Authentication

Supported authentication methods:

* Email & Password
* Google Sign-In
* Facebook Login

---

# 🔒 Privacy

User bicycles are private by default.

Only the owner can view their registered bikes unless a bike is marked as **Missing**, at which point only the information necessary to help identify and recover the bicycle is made public.

---

# 🎯 Project Goals

The first release focuses on solving real community needs for cyclists in Baguio:

* Build a trusted cycling community
* Promote local cycling events
* Improve rider safety
* Assist in recovering missing or stolen bicycles
* Create a centralized information hub for local cyclists

The application intentionally avoids unnecessary complexity during its MVP stage.

---

# 🚀 Future Roadmap

Planned future enhancements include:

* Expansion beyond Baguio City
* Push notifications
* Mobile applications
* Route sharing
* GPX support
* Marketplace
* Organization accounts
* Advanced moderation tools
* Public API
* Analytics dashboard

---

# 🗄 Database

The application uses **Supabase PostgreSQL** with a normalized relational schema.

Core modules include:

* Users
* Profiles
* Bikes
* Missing Bikes
* Events
* Posts
* Comments
* Reactions
* Hazard Reports
* Notifications

All tables implement **Row Level Security (RLS)** to ensure secure access.

---

# 🎨 Design Principles

This project follows several guiding principles:

* Mobile-first responsive design
* Simple and intuitive user experience
* Feature-based architecture
* Clean and maintainable code
* Accessibility-first components
* Performance-focused development
* Secure by default

---

# 🤝 Contributing

Contributions, bug reports, and feature suggestions are welcome.

Before submitting major changes, please open an issue to discuss the proposed improvement.

---

# 📄 License

This project is currently under active development.

A license will be added before the first public release.
