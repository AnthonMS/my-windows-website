Deploy notes:
Cloud Build:
Mirrored repository in google cloud from github.
Create triggers that listen to pushes on specific branches and build and deploys the site.

Cloud run to host website
Buy domain on simply
Figure out DNS
Figure out certificate


VPC Network -> IP addresses -> Reserve External Static IP Address
It uses forwarding rule

Network Services -> Load Balancing Create Load Balancer
Frontend has HTTPS Protocol that uses reservec external IP with certificate chain
It also uses a compute backend


Security -> Certificate Authority Service > CA Pool Manager -> Create CA
OR
Certificate Manager and let Google Manage Load Balancer Certificates?