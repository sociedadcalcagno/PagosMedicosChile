--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: agreement_types; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.agreement_types (id, code, name, description, created_at) FROM stdin;
\.


--
-- Data for Name: medical_societies; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.medical_societies (id, rut, name, address, phone, email, representative_rut, representative_name, created_at) FROM stdin;
soc001	76.123.456-7	Sociedad Médica Central	Av. Providencia 1234, Santiago	+56226781234	contacto@socmedcentral.cl	12.345.678-9	Dr. Alejandro Rodríguez	2025-08-05 02:42:11.671532
soc002	76.234.567-8	Centro Médico Las Condes	Av. Las Condes 567, Las Condes	+56223456789	admin@cmcondes.cl	23.456.789-0	Dra. María González	2025-08-05 02:42:11.671532
soc003	76.345.678-9	Clínica Universitaria	Av. Universidad 890, Ñuñoa	+56224567890	info@clinicau.cl	34.567.890-1	Dr. José Martínez	2025-08-05 02:42:11.671532
\.


--
-- Data for Name: specialties; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.specialties (id, code, name, description, participation_type, created_at) FROM stdin;
esp001	CAR	Cardiología	Especialidad médica dedicada al estudio, diagnóstico y tratamiento de las enfermedades del corazón	\N	2025-08-05 02:09:16.609013
esp002	NEU	Neurología	Especialidad médica que trata los trastornos del sistema nervioso	\N	2025-08-05 02:09:16.609013
esp003	PED	Pediatría	Especialidad médica que estudia al niño y sus enfermedades	\N	2025-08-05 02:09:16.609013
esp004	GIN	Ginecología	Especialidad médica dedicada al cuidado del sistema reproductor femenino	\N	2025-08-05 02:09:16.609013
esp005	TRA	Traumatología	Especialidad médica que se dedica al estudio de las lesiones del aparato locomotor	\N	2025-08-05 02:09:16.609013
esp006	OFT	Oftalmología	Especialidad médica que estudia las enfermedades de los ojos	\N	2025-08-05 02:09:16.609013
esp007	DER	Dermatología	Especialidad médica dedicada al estudio de la piel	\N	2025-08-05 02:09:16.609013
esp008	PSI	Psiquiatría	Especialidad médica dedicada al estudio de los trastornos mentales	\N	2025-08-05 02:09:16.609013
esp009	INT	Medicina Interna	Especialidad médica que se dedica a la atención integral del adulto	\N	2025-08-05 02:09:16.609013
esp010	CIR	Cirugía General	Especialidad médica dedicada a los procedimientos quirúrgicos	\N	2025-08-05 02:09:16.609013
esp011	RAD	Radiología	Especialidad médica que utiliza imágenes para diagnóstico y tratamiento	\N	2025-08-16 22:28:22.113767
esp012	RNM	Resonancia Nuclear Magnética	Especialidad en técnicas de imagen por resonancia magnética	\N	2025-08-16 22:28:22.113767
esp013	AMB	Ambulatorio	Atención médica ambulatoria general	\N	2025-08-16 22:28:22.113767
esp_1755400627676	URG	URG	Especialidad: URG	\N	2025-08-17 03:17:07.695987
esp_1755400817653	HOS	HOSP	Especialidad: HOSP	\N	2025-08-17 03:20:17.672249
\.


--
-- Data for Name: doctors; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.doctors (id, rut, name, email, phone, specialty_id, hmq_type, station, fonasa_agreements, society_type, society_rut, society_name, payment_type, bank_account, bank_name, account_holder_name, account_holder_rut, is_active, created_at) FROM stdin;
doc002	23456789-0	Dra. María Elena Rodríguez Silva	mrodriguez@clinica.cl	+56923456789	esp002	individual	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	2025-08-05 02:14:42.631258
b568d980-dffe-4c30-a3f1-b63a0f7a445e	51270342-K	51270342	51270342@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51270342	51270342-K	t	2025-08-17 01:50:37.870682
7c3a3df6-17e6-4885-a7ce-14757c4e8544	51270354-K	51270354	51270354@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51270354	51270354-K	t	2025-08-17 01:50:42.143956
b5e3b180-8fba-4af1-b615-56e5a36f80b3	51265236-K	51265236	51265236@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51265236	51265236-K	t	2025-08-17 01:50:46.501763
5055dc08-0429-4f6b-b7d3-9fe81ad4c5c1	51271122-K	51271122	51271122@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51271122	51271122-K	t	2025-08-17 01:50:51.071962
7bd0337c-bdc3-4718-b660-ee519903d1b7	51266699-K	51266699	51266699@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51266699	51266699-K	t	2025-08-17 01:50:55.577581
doc003	34567890-1	Dr. Carlos Alberto Pérez Morales	cperez@hospital.cl	+56934567890	esp003	individual		\N	individual	\N	\N	transfer					t	2025-08-05 02:14:42.631258
doc001	12345678-9	Dr. Juan Carlos González López	jgonzalez@hospital.cl	+56912345678	esp001	individual		\N	individual	\N	\N	transfer					t	2025-08-05 02:14:42.631258
cf192df5-d969-487e-9c42-7c049bd9698f	51263998-K	51263998	51263998@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51263998	51263998-K	t	2025-08-17 01:51:00.16691
doc004	45678901-2	Dra. Ana Sofía Martínez Flores	amartinez@clinica.cl	+56945678901	esp004	individual		\N	society	76.234.567-8	Centro Médico Las Condes	transfer					t	2025-08-05 02:14:42.631258
doc005	56789012-3	Dr. Roberto Luis Hernández Castro	rhernandez@hospital.cl	+56956789012	esp005	individual		\N	society	76.345.678-9	Clínica Universitaria	transfer					t	2025-08-05 02:14:42.631258
05d1f833-4e67-44fb-9c6c-a42be5485cf5	51264003-K	51264003	51264003@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51264003	51264003-K	t	2025-08-17 01:51:05.750211
e3a4bbfd-b741-41d5-9f1e-0a2d4a139c22	51272291-K	51272291	51272291@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51272291	51272291-K	t	2025-08-17 01:51:10.176783
14b4f1df-5e90-45dc-8a04-bee00a9df6b0	51263442-K	51263442	51263442@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51263442	51263442-K	t	2025-08-17 01:51:14.324769
48ea1f08-68c0-4f33-bc76-3d39c11aadb8	51269228-K	51269228	51269228@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51269228	51269228-K	t	2025-08-17 01:51:18.408143
25942e72-3c75-48af-996d-d372a49ae7e8	51267890-K	51267890	51267890@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267890	51267890-K	t	2025-08-17 01:51:22.505487
1ccbba5f-72f3-425d-9846-d9ef4697b862	51267902-K	51267902	51267902@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267902	51267902-K	t	2025-08-17 01:51:26.654792
f951dc77-3c26-4880-9ae7-80c1818a5fbe	51267914-K	51267914	51267914@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267914	51267914-K	t	2025-08-17 01:51:30.926826
e357dd5e-b806-4564-aa5b-36bb382dae25	14366756-1	ALARCON STUARDO RAUL 	alarconstuardoraul@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ALARCON STUARDO RAUL 	14366756-1	t	2025-08-17 01:57:45.553765
3e76bf02-8d53-4b40-9749-c34752f4f0e7	7056-K	Dr./Dra. MED7056	med7056@hospital.cl		\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	t	2025-08-05 21:59:51.561783
80cdcbf6-80ef-4eca-b26f-3d14ce9a5385	14481385-5	MIGUEL WEDELES CAROLINA 	miguelwedelescarolina@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			MIGUEL WEDELES CAROLINA 	14481385-5	t	2025-08-17 03:17:04.798074
9dd81035-cef2-4acf-abeb-72336329d6da	13450850-7	HERQUIÑIGO RECKMANN DAVID IVAN	herquiigoreckmanndavidivan@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			HERQUIÑIGO RECKMANN DAVID IVAN	13450850-7	t	2025-08-17 03:17:05.182133
0e73acff-7b2c-4744-a00b-408790960592	8418-K	Dr./Dra. MED8418	med8418@hospital.cl		\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	t	2025-08-05 21:59:52.667527
46b78018-adb1-4b48-9522-b419e4495569	9261-K	Dr./Dra. MED9261	med9261@hospital.cl		\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	t	2025-08-05 21:59:52.910132
f3cd75ae-1812-4f31-a545-9f322db58621	8910597-8	SAINI DEL OTERO JAVIER 	sainideloterojavier@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			SAINI DEL OTERO JAVIER 	8910597-8	t	2025-08-17 03:17:07.739187
32438311-c393-41c5-8e6d-658de3db82c7	8408-K	Dr./Dra. MED8408	med8408@hospital.cl		\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	t	2025-08-05 21:59:53.160305
d7d64e66-4b99-421f-ac9b-768067c83b0a	16606269-1	CARRAHA ALBARRAN SEBASTIAN ANDRES	carrahaalbarransebastianandres@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			CARRAHA ALBARRAN SEBASTIAN ANDRES	16606269-1	t	2025-08-17 03:17:07.937411
0e61d806-af9b-445a-af17-347357db8ab0	9218-K	Dr./Dra. MED9218	med9218@hospital.cl		\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	t	2025-08-05 21:59:54.115388
53574adb-15d9-47bb-a00d-df18dd3683e0	13917873-4	BRIEBA AGUIRRE MARIELA 	briebaaguirremariela@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			BRIEBA AGUIRRE MARIELA 	13917873-4	t	2025-08-17 03:17:08.369469
3bf10295-06af-4849-b7e8-090c78d81eca	9535523-4	ALARCON SANDOVAL LUIS 	alarconsandovalluis@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			ALARCON SANDOVAL LUIS 	9535523-4	t	2025-08-17 03:17:08.679487
815cd212-2a29-456b-bcea-d4cd479bf1ed	17085263-K	ZAMARIN BROCCO STEFANO 	zamarinbroccostefano@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			ZAMARIN BROCCO STEFANO 	17085263-K	t	2025-08-17 03:17:09.275945
3f4fa346-5023-4e94-a8fa-8d30774eb993	16942018-1	RODRIGUEZ PEREZ BENJAMIN 	rodriguezperezbenjamin@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			RODRIGUEZ PEREZ BENJAMIN 	16942018-1	t	2025-08-17 03:17:09.583621
dbd8b40f-65c0-4b75-b555-f07c872782e7	16691620-8	VILLALOBOS OLAVE MARCELO 	villalobosolavemarcelo@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			VILLALOBOS OLAVE MARCELO 	16691620-8	t	2025-08-17 03:17:11.417202
62cb1dce-7697-4e8a-9e51-199b9163fdc2	16207810-0	LAHSEN MORALES FRANCISCA 	lahsenmoralesfrancisca@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			LAHSEN MORALES FRANCISCA 	16207810-0	t	2025-08-17 03:17:11.768486
422400ed-9b4d-4c75-a8cc-f17e4b7e2fc6	7091-K	Dr./Dra. MED7091	med7091@hospital.cl		\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	t	2025-08-05 21:59:58.748014
07791b7c-0e8c-4fab-afb2-6841da6f20a1	7459-K	Dr./Dra. MED7459	med7459@hospital.cl		\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	t	2025-08-05 21:59:59.218189
4931aab9-cae7-4344-8a7e-c9a68dc92244	7872122-7	PEREZ LEON VICTOR 	perezleonvictor@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			PEREZ LEON VICTOR 	7872122-7	t	2025-08-17 03:17:11.961507
413b7fc5-10ab-4882-af22-22d4846b43e7	6405-K	Dr./Dra. MED6405	med6405@hospital.cl		\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	t	2025-08-05 21:59:59.705835
07e674b0-d16c-46fb-842b-9705c6893e32	15960034-3	MANTELLI DURAN ENZO 	mantelliduranenzo@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			MANTELLI DURAN ENZO 	15960034-3	t	2025-08-17 03:17:12.373189
3ff47696-474d-4a1f-8f98-3d5f2f2d6068	7635960-1	ETCHART CRUZ MARTIN 	etchartcruzmartin@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ETCHART CRUZ MARTIN 	7635960-1	t	2025-08-17 03:17:12.685058
1ec33445-ddda-4e56-bb52-42b6d7e6f3fe	9757-K	Dr./Dra. MED9757	med9757@hospital.cl		\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	t	2025-08-05 22:00:01.126116
2c261d0c-d1ba-48af-ad92-9b9cc4851478	10306574-7	DREWES ARANEDA JAIME 	ewesaranedajaime@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			DREWES ARANEDA JAIME 	10306574-7	t	2025-08-17 03:17:15.428411
62bc3255-87ab-48a3-be3a-d7d39d9c6936	51270343-K	51270343	51270343@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51270343	51270343-K	t	2025-08-17 01:50:38.299932
166114d9-9203-47e0-ad6d-7ba86041310f	9563-K	Dr./Dra. MED9563	med9563@hospital.cl		\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	t	2025-08-05 22:00:02.753097
601dfd71-e91b-45a2-bce0-c9b9e2f5d502	51270355-K	51270355	51270355@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51270355	51270355-K	t	2025-08-17 01:50:42.474087
397840bc-46d3-495b-ba7a-cabed6f44d17	51265237-K	51265237	51265237@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51265237	51265237-K	t	2025-08-17 01:50:46.880772
609ca347-343f-4d13-80b3-a58425f2c890	51271123-K	51271123	51271123@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51271123	51271123-K	t	2025-08-17 01:50:51.438613
568289d2-c35e-4561-8e80-5d8614d1708b	51266700-K	51266700	51266700@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51266700	51266700-K	t	2025-08-17 01:50:55.957668
a0f40c13-0c2d-4aec-a21a-3182b44cb647	51263999-K	51263999	51263999@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51263999	51263999-K	t	2025-08-17 01:51:00.551061
b861dd2e-940c-4890-bf30-d73eaf15c72d	51264004-K	51264004	51264004@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51264004	51264004-K	t	2025-08-17 01:51:06.129489
1358367a-7991-4cb5-be31-5bbd4e6ebb5d	8830-K	Dr./Dra. MED8830	med8830@hospital.cl		\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	t	2025-08-05 22:00:04.908807
4aee161e-9ea3-41ef-981a-51b1e9a9673f	7585-K	Dr./Dra. MED7585	med7585@hospital.cl		\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	t	2025-08-05 22:00:05.181122
ac018ca2-128c-4f9c-9f81-3107682339bd	51272292-K	51272292	51272292@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51272292	51272292-K	t	2025-08-17 01:51:10.510715
e52522c3-352e-44be-8d79-6dc1c8195739	51263443-K	51263443	51263443@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51263443	51263443-K	t	2025-08-17 01:51:14.672131
234880a2-5f16-4ed9-af1d-7d04b605723e	51269229-K	51269229	51269229@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51269229	51269229-K	t	2025-08-17 01:51:18.749184
99ed27ba-8634-4f4c-ba26-5f5cb9093f0e	51267891-K	51267891	51267891@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267891	51267891-K	t	2025-08-17 01:51:22.834642
29905c66-b3d0-4f92-b4d5-984d0189ca0c	51267903-K	51267903	51267903@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267903	51267903-K	t	2025-08-17 01:51:27.028831
95739dfa-ad9e-4a97-8913-ef62d4541c52	51270338-K	51270338	51270338@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51270338	51270338-K	t	2025-08-17 01:51:31.298276
7dc6b6c4-a5ba-4d04-a1c2-49b004f9b7fd	11348537-K	ROJAS LEAL JACQUELINE 	rojaslealjacqueline@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ROJAS LEAL JACQUELINE 	11348537-K	t	2025-08-17 03:17:15.974334
27e607ba-2b79-40e6-b8d9-bd15c78670cb	17700851-6	VON SENNITZKY KUPFER ANDREI 	vonsennitzkykupferandrei@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			VON SENNITZKY KUPFER ANDREI 	17700851-6	t	2025-08-17 03:17:18.383113
b148277d-d686-475e-a53a-52fb1c4a1fc2	7701478-0	CASTRO SALAS MARCELO 	castrosalasmarcelo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CASTRO SALAS MARCELO 	7701478-0	t	2025-08-17 03:17:18.889349
dcbe4252-3822-47fe-b40f-614b2edbd613	13468772-K	MATAMALA LOPEZ GONZALO EDUARDO	matamalalopezgonzaloeduardo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			MATAMALA LOPEZ GONZALO EDUARDO	13468772-K	t	2025-08-17 03:17:19.082181
27f83079-5a17-4d72-979d-6d4729592140	16609588-3	ALMARZA SALAS PAMELA 	almarzasalaspamela@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ALMARZA SALAS PAMELA 	16609588-3	t	2025-08-17 03:17:19.314854
f029c1da-2c5b-4193-ab5b-98aeb455b3ae	26287205-K	SOUKI CHMEIT RAMI 	soukichmeitrami@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			SOUKI CHMEIT RAMI 	26287205-K	t	2025-08-17 03:17:19.621477
78c5b866-ba94-43c0-9800-dd8119acda73	17553164-5	MENESES ISHIHARA DANIELA 	menesesishiharadaniela@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			MENESES ISHIHARA DANIELA 	17553164-5	t	2025-08-17 03:17:21.350427
1b2d1748-ffa1-43c1-8478-fdf9f483cb3c	17316801-2	VALLEJOS TOBAR GUSTAVO 	vallejostobargustavo@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			VALLEJOS TOBAR GUSTAVO 	17316801-2	t	2025-08-17 03:17:24.282878
f7b103f4-994e-46fd-a7de-5a8f6e611224	17201794-0	BARRIGA VARGAS JUAN PABLO 	barrigavargasjuanpablo@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			BARRIGA VARGAS JUAN PABLO 	17201794-0	t	2025-08-17 03:17:25.6444
6c26479c-6325-425f-8fff-7cbb2241532c	16486742-0	NANJARI PALOMINOS RENE 	nanjaripalominosrene@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			NANJARI PALOMINOS RENE 	16486742-0	t	2025-08-17 03:17:26.192049
37c106e4-2001-4e84-9744-cf7465671c0e	5528973-5	LOBO SOTOMAYOR PEDRO PABLO	lobosotomayorpedropablo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			LOBO SOTOMAYOR PEDRO PABLO	5528973-5	t	2025-08-17 03:17:28.16263
2a87ede6-c901-443d-bb4c-afd9191221b9	6622-K	Dr./Dra. MED6622	med6622@hospital.cl		\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	t	2025-08-05 22:00:11.369245
01b416b5-b833-43c6-ab19-01772e2223d7	25977088-2	SOTO HERNANDEZ GUILLERMO 	sotohernandezguillermo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			SOTO HERNANDEZ GUILLERMO 	25977088-2	t	2025-08-17 03:17:30.022752
55b42f98-e30f-4f08-8b76-fd2b26f945c3	12712732-8	RUBIO LOZANO ALEJANDRO 	rubiolozanoalejandro@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			RUBIO LOZANO ALEJANDRO 	12712732-8	t	2025-08-17 03:17:33.278044
d1ec0fc6-36e5-4ef5-a316-65daec0e89f5	7041329-9	MERCHAK ABSI MIRTA ADRIANA	merchakabsimirtaadriana@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			MERCHAK ABSI MIRTA ADRIANA	7041329-9	t	2025-08-17 03:17:35.525227
df20a2ba-ca1d-4870-9f66-e4875fb70ba9	14596559-4	DELLIEN ZELADA HOLVIS 	dellienzeladaholvis@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			DELLIEN ZELADA HOLVIS 	14596559-4	t	2025-08-17 03:17:36.738385
9a38ef10-760e-4d3f-8368-ea53f22e110f	12383296-5	CAMPOS GALVEZ ALVARO 	camposgalvezalvaro@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CAMPOS GALVEZ ALVARO 	12383296-5	t	2025-08-17 03:17:37.288549
3ecfd71c-2192-4662-8ca2-6649a64cbfd4	25865265-7	NAIM TORTOLERO LAURA 	naimtortolerolaura@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			NAIM TORTOLERO LAURA 	25865265-7	t	2025-08-17 03:17:39.668207
28e4338a-9311-4a4e-94eb-e9a8585af6fa	17402066-3	SANCHEZ PUGA MARIA MACARENA 	sanchezpugamariamacarena@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			SANCHEZ PUGA MARIA MACARENA 	17402066-3	t	2025-08-17 03:17:41.179824
db6a583f-405c-4dca-af7a-bca63538add2	10972872-1	BUTRON BAVESTRELLO SEBASTIAN ALEJANDRO	butronbavestrellosebastianalejandro@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			BUTRON BAVESTRELLO SEBASTIAN ALEJANDRO	10972872-1	t	2025-08-17 03:17:42.179193
9aefc144-7c7f-4bbb-8db9-74951c84b1ad	13067877-7	RUIZ-TAGLE PHILLIPS DANIEL 	ruiztaglephillipsdaniel@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			RUIZ-TAGLE PHILLIPS DANIEL 	13067877-7	t	2025-08-17 03:17:42.409003
10b359f0-06d1-41b2-abc0-8fc4528f8bbd	9987-K	Dr./Dra. MED9987	med9987@hospital.cl		\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	t	2025-08-05 22:24:11.852811
346727f9-bfb1-4bf8-a582-cca32dd16a6e	7664-K	Dr./Dra. MED7664	med7664@hospital.cl		\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	t	2025-08-05 22:24:12.300504
1fd982a2-98d3-41aa-a27a-29127f8dbd35	7590-K	Dr./Dra. MED7590	med7590@hospital.cl		\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	t	2025-08-05 22:24:12.89875
1496173d-71a0-44aa-9877-3a8485e74948	8738-K	Dr./Dra. MED8738	med8738@hospital.cl		\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	t	2025-08-05 22:24:13.496788
a4d5b2a2-44e0-4893-aa5f-837f76dd17f8	51270344-K	51270344	51270344@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51270344	51270344-K	t	2025-08-17 01:50:38.685879
54877e13-e2a6-4d74-b019-d5c2f5481fac	51270356-K	51270356	51270356@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51270356	51270356-K	t	2025-08-17 01:50:42.817107
27e8b8da-1b73-41ea-856d-98c2749f3424	6430-K	Dr./Dra. MED6430	med6430@hospital.cl		\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	t	2025-08-05 22:24:13.944426
4fdc22c4-6050-480f-b97b-f4b839d5c6fe	51265238-K	51265238	51265238@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51265238	51265238-K	t	2025-08-17 01:50:47.261052
0fa97e37-c488-4e2c-8b79-9b1d21b97111	8086-K	Dr./Dra. MED8086	med8086@hospital.cl		\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	t	2025-08-05 22:24:14.540932
95a33ba1-ee1a-45f8-8fe5-e7e2339276c7	51271124-K	51271124	51271124@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51271124	51271124-K	t	2025-08-17 01:50:51.808632
a16e5097-ac0b-4890-9205-8931c9779a1c	51266701-K	51266701	51266701@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51266701	51266701-K	t	2025-08-17 01:50:56.335191
a65c86cf-1cf7-49b8-aff2-643772df4edd	51264000-K	51264000	51264000@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51264000	51264000-K	t	2025-08-17 01:51:00.931795
4a01271c-1875-4a5d-bee2-b605e8df39bf	9977-K	Dr./Dra. MED9977	med9977@hospital.cl		\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	t	2025-08-05 22:24:15.13655
84fe5808-573a-4d69-b4d7-596b97e4ced5	51271559-K	51271559	51271559@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51271559	51271559-K	t	2025-08-17 01:51:06.507473
ccf7b871-7a62-4299-9e22-8733b77db29b	51272293-K	51272293	51272293@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51272293	51272293-K	t	2025-08-17 01:51:10.848537
35d88a91-aae7-4e05-8887-cb83aebd3f48	51263444-K	51263444	51263444@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51263444	51263444-K	t	2025-08-17 01:51:15.026504
1bb7b233-2161-43ca-a922-6f4d46320a3d	7476-K	Dr./Dra. MED7476	med7476@hospital.cl		\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	t	2025-08-05 22:24:15.734952
a45914bf-4c93-4666-b2dd-faa042c4e66c	51269230-K	51269230	51269230@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51269230	51269230-K	t	2025-08-17 01:51:19.08952
bce6bdac-e0d6-4b66-84bb-38e6e006f9d2	51267892-K	51267892	51267892@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267892	51267892-K	t	2025-08-17 01:51:23.172909
d601aea0-948d-4284-9736-40fc96d68619	51267904-K	51267904	51267904@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267904	51267904-K	t	2025-08-17 01:51:27.367734
a70c70e6-f232-4a6b-aee9-0afb9ebbb7f9	51270339-K	51270339	51270339@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51270339	51270339-K	t	2025-08-17 01:51:31.671558
0c67df1e-a7e1-41e2-839a-19efcabf722c	8444067-1	OKSENBERG REISBERG DANNY 	oksenbergreisbergdanny@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			OKSENBERG REISBERG DANNY 	8444067-1	t	2025-08-17 03:17:42.887287
fd211a2e-d507-42d0-8130-f561374a2e58	12284711-K	POBLETE CURRIHUAL SERGIO ORLANDO	pobletecurrihualsergioorlando@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			POBLETE CURRIHUAL SERGIO ORLANDO	12284711-K	t	2025-08-17 03:17:43.794052
2ec2c657-ee0d-47fb-b376-19877edd5cc6	6706-K	Dr./Dra. MED6706	med6706@hospital.cl		\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	t	2025-08-05 22:24:16.776027
6414c80e-d34b-401f-a941-61ba6ac9c84d	17088316-0	CORVALAN ROCA GONZALO JOSE	corvalanrocagonzalojose@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CORVALAN ROCA GONZALO JOSE	17088316-0	t	2025-08-17 03:17:44.095338
6a3debde-f461-44ad-872e-1bcc1af46473	7910859-6	LEYTON NARANJO RODRIGO EUGENIO	leytonnaranjorodrigoeugenio@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			LEYTON NARANJO RODRIGO EUGENIO	7910859-6	t	2025-08-17 03:17:44.330631
d7cf629f-d041-4d4e-8fe2-706845d69ffb	8004559-K	NUÑEZ VASQUEZ NELSON GUSTAVO	nuezvasqueznelsongustavo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			NUÑEZ VASQUEZ NELSON GUSTAVO	8004559-K	t	2025-08-17 03:17:44.561216
fcb3c801-4a94-48e6-bedb-6ead2b5dbf12	10562468-9	ROBLES GUIC IGNACIO 	roblesguicignacio@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ROBLES GUIC IGNACIO 	10562468-9	t	2025-08-17 03:17:44.796711
e54f1996-9d6a-4d53-b828-aaf0309a304b	17601371-0	CLARK SALAZAR NICOLE AMANDA	clarksalazarnicoleamanda@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			CLARK SALAZAR NICOLE AMANDA	17601371-0	t	2025-08-17 03:17:45.310785
2ec2d2f2-cf64-493c-b953-e58b6a796533	14607772-2	TRONCOSO VILLA SYLVIA VERONICA	troncosovillasylviaveronica@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			TRONCOSO VILLA SYLVIA VERONICA	14607772-2	t	2025-08-17 03:17:46.351611
384d2123-12e9-4814-93e1-7d6f8137a728	9695-K	Dr./Dra. MED9695	med9695@hospital.cl		\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	t	2025-08-05 22:24:17.969133
1bfb54c8-88d8-4927-ab33-b44c9984c43e	8886-K	Dr./Dra. MED8886	med8886@hospital.cl		\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	t	2025-08-05 22:24:18.119678
06da0d18-9339-4501-be93-77a1d233fd85	14733459-1	BAREÑO QUINTANA SANDRA 	bareoquintanasandra@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			BAREÑO QUINTANA SANDRA 	14733459-1	t	2025-08-17 03:17:47.288134
ba8457fb-d0cf-4ac0-9367-2ea5f3546eb7	14128062-7	SWITT RIVEROS MARGARITA 	swittriverosmargarita@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			SWITT RIVEROS MARGARITA 	14128062-7	t	2025-08-17 03:17:47.60174
ae03a117-5619-45fa-94ae-3778ad50424f	8519161-6	SALAS ZULETA ALVARO 	salaszuletaalvaro@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			SALAS ZULETA ALVARO 	8519161-6	t	2025-08-17 03:17:47.914023
a63037c0-44c2-4030-a287-68d75aa2cca1	16101897-K	DIAZ ARANCIBIA DANIELA 	diazarancibiadaniela@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			DIAZ ARANCIBIA DANIELA 	16101897-K	t	2025-08-17 03:17:50.593958
caad788f-ceba-4d94-8df1-b133339d33c7	14151004-5	SALINAS QUERO ABRIL 	salinasqueroabril@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			SALINAS QUERO ABRIL 	14151004-5	t	2025-08-17 03:17:51.14619
975000b9-0195-4239-9081-cba7cb73f5de	26116003-K	KOURY LOPEZ MUFID ABELARDO	kourylopezmufidabelardo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			KOURY LOPEZ MUFID ABELARDO	26116003-K	t	2025-08-17 03:17:51.376146
af90e662-b069-4784-bd32-88e174381358	13067357-0	SILVA FIGUEROA VERONICA ALEJANDRA	silvafigueroaveronicaalejandra@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			SILVA FIGUEROA VERONICA ALEJANDRA	13067357-0	t	2025-08-17 03:17:51.569081
c8941b14-2e68-4399-b480-145f173b90d9	6095009-1	ANDUEZA GONZALEZ RICARDO 	anduezagonzalezricardo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ANDUEZA GONZALEZ RICARDO 	6095009-1	t	2025-08-17 03:17:51.88841
70efb964-ce66-41ed-b794-09f74e3f50f4	17192854-0	MICHAEL LARENAS PIA 	michaellarenaspia@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			MICHAEL LARENAS PIA 	17192854-0	t	2025-08-17 03:17:52.135192
71873743-a4bf-4a76-a581-0c6146d046d5	13474374-3	YAQUICH SAUD PAMELA VERONICA	yaquichsaudpamelaveronica@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			YAQUICH SAUD PAMELA VERONICA	13474374-3	t	2025-08-17 03:17:52.37782
47a34a67-a2eb-4cef-9faf-45edb15d309c	15045502-2	CARVAJAL ROZAS ALEJANDRO 	carvajalrozasalejandro@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CARVAJAL ROZAS ALEJANDRO 	15045502-2	t	2025-08-17 03:17:52.581554
222327c2-9a0a-45d5-a2d8-42f5a777710a	16244664-9	ALWANE OLMOS ESTEBAN IVAN	alwaneolmosestebanivan@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ALWANE OLMOS ESTEBAN IVAN	16244664-9	t	2025-08-17 03:17:53.64024
2d876ce5-9a6c-4862-bfa2-481a85dedabe	8910-K	Dr./Dra. MED8910	med8910@hospital.cl		\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	t	2025-08-05 22:24:20.948522
97d401ba-0e2c-4590-9313-8dfa8a34a713	51270345-K	51270345	51270345@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51270345	51270345-K	t	2025-08-17 01:50:39.030707
e1aef6b9-b183-407a-8920-c694f9ec0c12	51270357-K	51270357	51270357@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51270357	51270357-K	t	2025-08-17 01:50:43.171145
5f72149f-2cc6-42eb-ab43-3b8bf3197d44	51265239-K	51265239	51265239@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51265239	51265239-K	t	2025-08-17 01:50:47.637667
3ddeff4f-863e-43da-bf43-ef499a069494	51271125-K	51271125	51271125@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51271125	51271125-K	t	2025-08-17 01:50:52.183631
ab68b63c-5052-407b-8f63-ce0ee590d194	51266702-K	51266702	51266702@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51266702	51266702-K	t	2025-08-17 01:50:56.713411
5f4080a9-99f6-4c97-90d8-86ec2ace11ff	51264001-K	51264001	51264001@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51264001	51264001-K	t	2025-08-17 01:51:01.347354
1ddb6f71-87d6-4ed8-b538-c6d32dfda40b	51271560-K	51271560	51271560@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51271560	51271560-K	t	2025-08-17 01:51:06.87707
1160e63d-0698-4ddc-af43-f42987b41960	51272294-K	51272294	51272294@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51272294	51272294-K	t	2025-08-17 01:51:11.176905
0b46550a-5905-4870-971a-209945152630	6655-K	Dr./Dra. MED6655	med6655@hospital.cl		\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	t	2025-08-05 22:24:24.09139
5aa73c26-12d7-4d7b-b98d-d02f3c072cd1	51263445-K	51263445	51263445@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51263445	51263445-K	t	2025-08-17 01:51:15.372233
b61e949c-23b3-4891-a687-44c5673d423f	51269231-K	51269231	51269231@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51269231	51269231-K	t	2025-08-17 01:51:19.450141
2e8449c1-5a43-4daf-8e88-96f4b5110883	51267893-K	51267893	51267893@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267893	51267893-K	t	2025-08-17 01:51:23.511907
c46d86bf-1268-4bb7-b802-bb7b85231371	51267905-K	51267905	51267905@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267905	51267905-K	t	2025-08-17 01:51:27.707537
9f1d0f31-d2d3-4464-b7d3-a11d616eabce	51270340-K	51270340	51270340@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51270340	51270340-K	t	2025-08-17 01:51:32.094942
f53a236d-6d75-4fe6-aefe-797fc18e1b38	10262948-5	ORELLANA ARAYA PABLO 	orellanaarayapablo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ORELLANA ARAYA PABLO 	10262948-5	t	2025-08-17 03:17:53.83529
3e1da8d5-2761-4c61-a86f-15ef5d7eed5f	13673186-6	JADUE ANDRIOLA NICOLE ANDREA 	jadueandriolanicoleandrea@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			JADUE ANDRIOLA NICOLE ANDREA 	13673186-6	t	2025-08-17 03:17:54.069911
c6c58ea8-e3be-4154-afa7-5b63b4a79330	15711175-2	MORDOJOVICH ZUÑIGA EDUARDO ANDRES	mordojovichzuigaeduardoandres@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			MORDOJOVICH ZUÑIGA EDUARDO ANDRES	15711175-2	t	2025-08-17 03:17:54.298774
c5842440-0552-46a7-8e8a-801625cc5a91	12516798-5	AVENDAÑO MEJIAS HUGO LENIN	avendaomejiashugolenin@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			AVENDAÑO MEJIAS HUGO LENIN	12516798-5	t	2025-08-17 03:17:54.492996
931d382b-911d-4cf9-9cb1-28af8f7d9d95	16068981-1	AGUIRRE VICENTE SEBASTIAN 	aguirrevicentesebastian@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			AGUIRRE VICENTE SEBASTIAN 	16068981-1	t	2025-08-17 03:17:56.000829
e145f8c9-238d-438e-886f-1701b1530202	5728412-9	DIGHERO TRAVERSO HUMBERTO 	digherotraversohumberto@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			DIGHERO TRAVERSO HUMBERTO 	5728412-9	t	2025-08-17 03:18:00.221288
6f69ab8b-1326-4c4a-90b2-233d1fcc93d0	11229081-8	CARO THAYER CLAUDIO ALEJANDRO	carothayerclaudioalejandro@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CARO THAYER CLAUDIO ALEJANDRO	11229081-8	t	2025-08-17 03:18:00.41488
15f3a266-bc9f-46aa-aa00-ebcdb5727909	6874-K	Dr./Dra. MED6874	med6874@hospital.cl		\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	t	2025-08-05 22:24:26.436484
d8e294cd-649a-47b4-9bbf-cb2d23667f7a	13831468-5	CHAVEZ THOMAS FERNANDO EDUARDO	chavezthomasfernandoeduardo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CHAVEZ THOMAS FERNANDO EDUARDO	13831468-5	t	2025-08-17 03:18:01.42373
91fd82ac-0caf-40b3-acd6-21d3e425a4fb	8454972-K	CARVAJAL KERSANOVA NILO 	carvajalkersanovanilo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CARVAJAL KERSANOVA NILO 	8454972-K	t	2025-08-17 03:18:01.937734
028e5a55-e76e-4d3e-bc75-26e9ba5eb528	13690756-5	BARRIOS RODRIGUEZ PEDRO HERNAN	barriosrodriguezpedrohernan@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			BARRIOS RODRIGUEZ PEDRO HERNAN	13690756-5	t	2025-08-17 03:18:02.601759
248b3a9e-fd95-4724-b58d-ecaca58f69b2	8442489-7	ITURRA AVILES ALBERTO 	iturraavilesalberto@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ITURRA AVILES ALBERTO 	8442489-7	t	2025-08-17 03:18:03.812723
039877e9-7005-48cc-8211-e31c23355b6a	7223393-K	BASILIO FARIAS PATRICIO 	basiliofariaspatricio@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			BASILIO FARIAS PATRICIO 	7223393-K	t	2025-08-17 03:18:05.54676
8c33deb4-4a61-45ea-96ce-85ac97dd3e15	8447849-0	COTRONEO ESCOBAR JAIME EDGARDO	cotroneoescobarjaimeedgardo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			COTRONEO ESCOBAR JAIME EDGARDO	8447849-0	t	2025-08-17 03:18:08.875367
7bb719f7-36ec-4f34-a4e3-39e6d926fbc8	11240072-9	ROSSEL MARIANGEL VICTOR ALEJANDRO	rosselmariangelvictoralejandro@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ROSSEL MARIANGEL VICTOR ALEJANDRO	11240072-9	t	2025-08-17 03:18:09.365125
c29aff6f-8e79-440d-bedd-ab8a23a58d65	10527508-0	PEREZ NUÑEZ CHRISTIAN PABLO	pereznuezchristianpablo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			PEREZ NUÑEZ CHRISTIAN PABLO	10527508-0	t	2025-08-17 03:18:09.559581
aa935677-f045-4c65-b6dc-e16e7b31a7f1	10991754-0	SAPUNAR GONZALEZ JASNA 	sapunargonzalezjasna@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			SAPUNAR GONZALEZ JASNA 	10991754-0	t	2025-08-17 03:18:09.754877
257c6ebb-e4ed-4dbe-9100-282e1fc6c110	9772724-4	FIGUEROA POBLETE JORGE EDUARDO	figueroapobletejorgeeduardo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			FIGUEROA POBLETE JORGE EDUARDO	9772724-4	t	2025-08-17 03:18:10.798819
d7c8e736-6875-4314-a786-457a77ad4b1c	15774819-K	LATORRE BRAJOVIC PATRICIO 	latorrebrajovicpatricio@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			LATORRE BRAJOVIC PATRICIO 	15774819-K	t	2025-08-17 03:42:37.945887
dd6fbec5-45c8-48a9-afc0-69f985e14e91	6653744-7	AGUAYO NAYLE ADRIANA 	aguayonayleadriana@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			AGUAYO NAYLE ADRIANA 	6653744-7	t	2025-08-17 03:42:43.484108
4d3a2000-aab9-4136-85ea-a538b0c6db61	6143115-2	BENOIT NOGUERA DENISE 	benoitnogueradenise@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			BENOIT NOGUERA DENISE 	6143115-2	t	2025-08-17 03:42:43.920595
50b4be93-b5df-457b-bc8b-f501fc6c0ae2	16098944-0	ZAMBRANO CARTES FLORENCIA 	zambranocartesflorencia@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ZAMBRANO CARTES FLORENCIA 	16098944-0	t	2025-08-17 03:42:44.484658
c43d6615-6315-40bc-ad24-618dd8058d7e	15671647-2	VARGAS LAVIN DENISSE BARBARA	vargaslavindenissebarbara@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			VARGAS LAVIN DENISSE BARBARA	15671647-2	t	2025-08-17 03:42:44.689615
49c905f4-24f1-4524-8757-d7eab380c146	13830120-6	MERCADO VIVALLOS MONSERRAT .	mercadovivallosmonserrat@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			MERCADO VIVALLOS MONSERRAT .	13830120-6	t	2025-08-17 03:42:45.055498
ff642fee-c350-473e-85e8-cb422bc5ecf6	14576234-0	LINARES PASSERINI MARCELA 	linarespasserinimarcela@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			LINARES PASSERINI MARCELA 	14576234-0	t	2025-08-17 03:43:05.831845
df60d410-e982-406d-901c-37c9bcafacd8	51270346-K	51270346	51270346@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51270346	51270346-K	t	2025-08-17 01:50:39.368406
4dd961c8-70f5-4d49-a76b-76cfa11a1d19	51270358-K	51270358	51270358@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51270358	51270358-K	t	2025-08-17 01:50:43.514566
5240d763-d39c-4540-9d7b-0fdf629bcbab	51266245-K	51266245	51266245@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51266245	51266245-K	t	2025-08-17 01:50:48.015561
aec3b455-b544-4f78-ab67-2442f378e45d	51271126-K	51271126	51271126@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51271126	51271126-K	t	2025-08-17 01:50:52.558756
09bdebe9-0ad9-4344-9f77-6d870e5b9cf1	51266703-K	51266703	51266703@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51266703	51266703-K	t	2025-08-17 01:50:57.088657
d7255d6d-b60b-4460-8bee-19eb3e0b0a43	51264002-K	51264002	51264002@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51264002	51264002-K	t	2025-08-17 01:51:01.722867
35c790db-3c57-4835-97a2-56fba899fa3c	51271561-K	51271561	51271561@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51271561	51271561-K	t	2025-08-17 01:51:07.288612
708fa5ac-4f30-49da-85fe-7caf588057a9	51272295-K	51272295	51272295@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51272295	51272295-K	t	2025-08-17 01:51:11.576158
1f5e7930-4624-4488-8283-5402b2d276e0	51263446-K	51263446	51263446@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51263446	51263446-K	t	2025-08-17 01:51:15.722909
75bb4e83-5475-47e3-ac59-506f559684d8	51269232-K	51269232	51269232@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51269232	51269232-K	t	2025-08-17 01:51:19.787409
e17c01c8-1c4f-4908-aa3d-b399f5825e8a	51267894-K	51267894	51267894@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267894	51267894-K	t	2025-08-17 01:51:23.873312
fdbef983-2f44-4500-9873-86b4b1c0d18e	51267906-K	51267906	51267906@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267906	51267906-K	t	2025-08-17 01:51:28.045036
fa62fbc6-1dcd-466a-9d29-caf5038b9356	51270341-K	51270341	51270341@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51270341	51270341-K	t	2025-08-17 01:51:32.507254
58e79402-f2e9-4bfb-8f0e-25dc88b219b2	17351387-9	FIGUEROA DIAZ PAULA ROCIO 	figueroadiazpaularocio@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			FIGUEROA DIAZ PAULA ROCIO 	17351387-9	t	2025-08-17 03:18:11.940419
edfe9dc8-86fa-4205-a9a8-dec3c6954050	16606618-2	ERRAZURIZ BULNES JUAN IGNACIO	errazurizbulnesjuanignacio@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ERRAZURIZ BULNES JUAN IGNACIO	16606618-2	t	2025-08-17 03:18:14.55761
6421a72d-bb32-418a-9b39-c06983d3b409	16300956-0	BERNSTEIN BENGOA TOMAS 	bernsteinbengoatomas@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			BERNSTEIN BENGOA TOMAS 	16300956-0	t	2025-08-17 03:18:14.872196
4ade334d-2028-46ab-9e9c-51e303ffc7ae	10650112-2	MENESES VALENZUELA NELSON 	menesesvalenzuelanelson@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			MENESES VALENZUELA NELSON 	10650112-2	t	2025-08-17 03:18:15.780885
bb9beb29-cc95-4643-9cf6-7f70756820b6	8530299-K	GUACHALLA PIZARRO MONICA 	guachallapizarromonica@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			GUACHALLA PIZARRO MONICA 	8530299-K	t	2025-08-17 03:18:17.830817
0a5142f2-e28d-44ad-9ac5-d48cdfa4d0bb	6476285-0	BAEZA RODRIGUEZ PATRICIO 	baezarodriguezpatricio@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			BAEZA RODRIGUEZ PATRICIO 	6476285-0	t	2025-08-17 03:18:18.272829
18cc3e22-933f-41ec-9159-2471587158c2	13902854-6	PAULSEN GUEVARA PAULINA JESUS	paulsenguevarapaulinajesus@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			PAULSEN GUEVARA PAULINA JESUS	13902854-6	t	2025-08-17 03:18:20.95245
16f3a1a4-b4f1-41eb-b1fa-4353828e9a67	10194019-5	COBOS BOMBARDIERE MARIA PAZ 	cobosbombardieremariapaz@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			COBOS BOMBARDIERE MARIA PAZ 	10194019-5	t	2025-08-17 03:18:22.735881
a01f0c6d-3f21-4567-8026-3f861e36a5b6	11819541-8	MORALES AHUMADA CARLOS FRANCISCO	moralesahumadacarlosfrancisco@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			MORALES AHUMADA CARLOS FRANCISCO	11819541-8	t	2025-08-17 03:18:23.657097
b59a509f-5fee-49fd-883b-e15c3a015dac	7342562-K	AGUAYO FIGUEROA JOYSE GEORGINA	aguayofigueroajoysegeorgina@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			AGUAYO FIGUEROA JOYSE GEORGINA	7342562-K	t	2025-08-17 03:18:23.849488
28be2c85-df4d-46c5-bbf2-48dce5712785	15126504-9	ROSSEL BUSTAMANTE NATALIA 	rosselbustamantenatalia@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			ROSSEL BUSTAMANTE NATALIA 	15126504-9	t	2025-08-17 03:18:26.186981
d91c6bf5-255d-47d5-82e0-68ec22c070fd	21618583-8	PEÑA DE OLIVERA LUIS RODOLFO 	peadeoliveraluisrodolfo@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			PEÑA DE OLIVERA LUIS RODOLFO 	21618583-8	t	2025-08-17 03:18:26.381641
d622c04f-b3a3-4d04-b03e-c54440136556	13611038-1	NUÑEZ FLORES RENE HERNAN	nuezfloresrenehernan@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			NUÑEZ FLORES RENE HERNAN	13611038-1	t	2025-08-17 03:18:27.287374
ab4b25d7-1ecd-4937-8845-65d4a45895ad	9492572-K	SIERRA ZAPATA ALFREDO 	sierrazapataalfredo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			SIERRA ZAPATA ALFREDO 	9492572-K	t	2025-08-17 03:18:31.730216
4eeb49c3-4b86-49ec-b01a-b73a1d7c0ed1	14136261-5	GANA HERVIAS JUAN 	ganaherviasjuan@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			GANA HERVIAS JUAN 	14136261-5	t	2025-08-17 03:18:32.157303
df75f3b9-b4d4-4062-ba74-51a377deaeb5	10063724-3	ESCALONA URIBE MARCELA PAZ	escalonauribemarcelapaz@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ESCALONA URIBE MARCELA PAZ	10063724-3	t	2025-08-17 03:18:32.833529
cd4bbbd7-d717-48d8-bd71-7ea859130239	7108054-4	RESTOVIC CARMONA JUAN 	restoviccarmonajuan@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			RESTOVIC CARMONA JUAN 	7108054-4	t	2025-08-17 03:18:33.14872
22b9ff70-2ecc-46e7-8ae2-00bbbdd7bccd	6944400-8	BARQUIN DE LA CUADRA INES 	barquindelacuadraines@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			BARQUIN DE LA CUADRA INES 	6944400-8	t	2025-08-17 03:18:34.075284
d96cd07a-d7ea-4001-be4d-a2c1ae422799	12261963-K	PEÑA LOPEZ PATRICIO 	pealopezpatricio@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			PEÑA LOPEZ PATRICIO 	12261963-K	t	2025-08-17 03:18:34.752552
26ac0282-c2d0-4d5e-9267-045e3d41e6c2	25730763-8	REQUENA OCHOA DANIEL 	requenaochoadaniel@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			REQUENA OCHOA DANIEL 	25730763-8	t	2025-08-17 03:18:35.060578
2da0066f-a319-4410-be31-0c46a1c5327b	10078019-4	BLAMEY ARIAS FRANCIS ELIZABETH	blameyariasfranciselizabeth@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			BLAMEY ARIAS FRANCIS ELIZABETH	10078019-4	t	2025-08-17 03:18:35.292062
7215111b-d9c0-4967-94a3-52845b0dc0ac	14739877-8	SALTOS GILER ZOILA KATHERYNE	saltosgilerzoilakatheryne@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			SALTOS GILER ZOILA KATHERYNE	14739877-8	t	2025-08-17 03:18:35.482722
125e4270-a4e2-421d-87e3-54f113b1c9a5	14621359-6	MORALES PAULETTI INGRID 	moralespaulettiingrid@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			MORALES PAULETTI INGRID 	14621359-6	t	2025-08-17 03:18:36.270198
3f451f8c-9be0-466d-8de0-0d2935e14400	14410245-2	ISA PARAM RODRIGO ANDRÉS	isaparamrodrigoandrs@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ISA PARAM RODRIGO ANDRÉS	14410245-2	t	2025-08-17 03:18:36.462995
9d21a1cc-7098-40a9-9f64-8d1662e64a0b	8336084-4	AGUILA GARAY RODRIGO 	aguilagarayrodrigo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			AGUILA GARAY RODRIGO 	8336084-4	t	2025-08-17 03:18:36.655093
d0df87b6-4e85-4b72-a9cb-3fb0e39d0f83	51270347-K	51270347	51270347@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51270347	51270347-K	t	2025-08-17 01:50:39.740144
b096d32c-c6c9-4006-a82b-ce939764c7c8	51270359-K	51270359	51270359@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51270359	51270359-K	t	2025-08-17 01:50:43.847296
1bd01fb3-3c1d-4223-8405-1794e29f622a	51266246-K	51266246	51266246@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51266246	51266246-K	t	2025-08-17 01:50:48.383899
9b9caebe-dcb4-419a-8e88-261f978db201	51271127-K	51271127	51271127@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51271127	51271127-K	t	2025-08-17 01:50:52.935557
b6bdf6fc-1981-4785-b722-83cccf13aab0	51266704-K	51266704	51266704@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51266704	51266704-K	t	2025-08-17 01:50:57.48808
4a1e6e0c-3e65-461d-b206-8e5ad6053b52	51268427-K	51268427	51268427@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51268427	51268427-K	t	2025-08-17 01:51:02.096463
f8fb449a-6b83-44a6-a565-34c175f3fc2c	51271562-K	51271562	51271562@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51271562	51271562-K	t	2025-08-17 01:51:07.628668
9b6d6b75-b0e5-4bad-a39f-c766e38c56aa	51272296-K	51272296	51272296@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51272296	51272296-K	t	2025-08-17 01:51:11.920817
c8b019de-2201-4026-a408-c923b024df25	51263447-K	51263447	51263447@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51263447	51263447-K	t	2025-08-17 01:51:16.059016
6c4ec1bc-0dba-41ac-8bc2-bb27e4daf35f	51269233-K	51269233	51269233@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51269233	51269233-K	t	2025-08-17 01:51:20.125982
f5199bb4-a589-4f12-9022-8c19329314bb	51267895-K	51267895	51267895@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267895	51267895-K	t	2025-08-17 01:51:24.230219
adba6008-5962-4b90-9fff-8febdc5ffa05	51267907-K	51267907	51267907@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267907	51267907-K	t	2025-08-17 01:51:28.384164
81cc32d7-e733-4a49-be0f-f608ab207391	18403994-K	CORTES FUENTES IGNACIO ANTONIO	cortesfuentesignacioantonio@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			CORTES FUENTES IGNACIO ANTONIO	18403994-K	t	2025-08-17 03:18:41.377653
0bb22587-9a51-41e9-b435-884ad26284ec	15838298-9	VEYL QUINTEROS NICOLE 	veylquinterosnicole@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			VEYL QUINTEROS NICOLE 	15838298-9	t	2025-08-17 03:18:41.769368
885432f2-a3a3-46ba-b495-bf34de44a08e	16213417-5	FERNANDEZ ELGUETA KARLA 	fernandezelguetakarla@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			FERNANDEZ ELGUETA KARLA 	16213417-5	t	2025-08-17 03:18:42.432082
1ca320d7-887e-4e1a-bfdb-e0986ad8f9dc	15958965-K	PARROCHIA ROJAS JUAN FRANCISCO 	parrochiarojasjuanfrancisco@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			PARROCHIA ROJAS JUAN FRANCISCO 	15958965-K	t	2025-08-17 03:18:42.94208
6c38a840-9af5-41c0-815b-5196c78df6f9	16211011-K	CORREA RODRIGUEZ IGNACIO ANDRES	correarodriguezignacioandres@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CORREA RODRIGUEZ IGNACIO ANDRES	16211011-K	t	2025-08-17 03:18:48.010701
34004a33-8d15-4226-a987-77ad728affc8	13471467-0	SOTO KORT EMILIO JAVIER	sotokortemiliojavier@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			SOTO KORT EMILIO JAVIER	13471467-0	t	2025-08-17 03:18:48.751236
f2ae2065-0531-4eba-8db1-53a82f092ca7	24241857-3	AZEVEDO CRISPIM MAYRANA 	azevedocrispimmayrana@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			AZEVEDO CRISPIM MAYRANA 	24241857-3	t	2025-08-17 03:18:50.140465
04aea366-4e04-46fa-808e-4c583ae1c512	13663953-6	BOZZO HENRIQUEZ RODRIGO JOSE	bozzohenriquezrodrigojose@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			BOZZO HENRIQUEZ RODRIGO JOSE	13663953-6	t	2025-08-17 03:18:51.412435
791bc2a7-8841-4ac0-9895-593d44d51d51	10544439-7	RIVERA CARRILLO MARCELA ANDREA	riveracarrillomarcelaandrea@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			RIVERA CARRILLO MARCELA ANDREA	10544439-7	t	2025-08-17 03:18:51.646636
dcebd9b1-ba60-41f5-aa36-2f2d56acb49f	15372386-9	MORENO MORENO CLAUDIA PAZ 	morenomorenoclaudiapaz@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			MORENO MORENO CLAUDIA PAZ 	15372386-9	t	2025-08-17 03:18:57.783334
e877980a-7761-4224-a94d-36a226813746	13424738-K	SILVA CARMONA MAURICIO 	silvacarmonamauricio@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			SILVA CARMONA MAURICIO 	13424738-K	t	2025-08-17 03:18:57.979385
b79b572a-9cd3-45c8-bd7b-b664ed96b478	9464218-3	GARRIDO BIANCO JAIME 	garridobiancojaime@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			GARRIDO BIANCO JAIME 	9464218-3	t	2025-08-17 03:18:58.288493
9a276165-3e9f-4a60-a20c-b069bc36bbd2	9996636-K	LOPEZ OPITZ JAVIER 	lopezopitzjavier@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			LOPEZ OPITZ JAVIER 	9996636-K	t	2025-08-17 03:18:58.911088
5bcd53ff-437a-48cd-8d63-692dbf663007	9371665-5	BUSTOS DONOSO CRISTIAN 	bustosdonosocristian@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			BUSTOS DONOSO CRISTIAN 	9371665-5	t	2025-08-17 03:18:59.139845
9576dce2-ad25-4f2f-b0ae-dfb0891b3290	13234554-6	BESIO HERNANDEZ CRISTOBAL FRANCISCO	besiohernandezcristobalfrancisco@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			BESIO HERNANDEZ CRISTOBAL FRANCISCO	13234554-6	t	2025-08-17 03:18:59.362511
458ee3e7-191c-42e5-9bfe-4f8c1842ed06	18640243-K	CAMPOS DEPIX LAURA IGNACIA	camposdepixlauraignacia@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			CAMPOS DEPIX LAURA IGNACIA	18640243-K	t	2025-08-17 03:19:00.312023
2e10cb9f-0221-414b-82bf-3951dd0e8f77	18312502-8	ESPINOZA VARGAS DIEGO ANDRES	espinozavargasdiegoandres@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			ESPINOZA VARGAS DIEGO ANDRES	18312502-8	t	2025-08-17 03:19:00.51764
887d7f12-5e8f-4935-be97-8fb0a490d484	18021007-5	MINOND JASHES GABRIEL 	minondjashesgabriel@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			MINOND JASHES GABRIEL 	18021007-5	t	2025-08-17 03:19:01.908475
ee99813a-adc4-4b0c-ae31-a2bad8496a37	16605668-3	RAMIREZ MONTES DIEGO 	ramirezmontesdiego@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			RAMIREZ MONTES DIEGO 	16605668-3	t	2025-08-17 03:19:05.07308
7ade67cc-1f20-4271-915a-311b53594c55	14576608-7	SOTA MERCADO MILUSKA 	sotamercadomiluska@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			SOTA MERCADO MILUSKA 	14576608-7	t	2025-08-17 03:19:05.738195
72b1e169-4deb-4542-8cbc-d3cbf78de0a6	12272294-5	CANDIA FLORES SANDRA 	candiafloressandra@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CANDIA FLORES SANDRA 	12272294-5	t	2025-08-17 03:19:05.931497
8cc76d4f-0cbe-4600-8812-76a22356fb0c	15639427-0	ROJAS BRAIN RENE 	rojasbrainrene@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ROJAS BRAIN RENE 	15639427-0	t	2025-08-17 03:19:06.57187
4c0a803b-a46c-4ded-8e44-88a477002ac1	14750157-9	FLORES WONG ANGEL HUGO	floreswongangelhugo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			FLORES WONG ANGEL HUGO	14750157-9	t	2025-08-17 03:19:06.88681
3c6e0638-8836-4e63-b0a9-db46c77e2ab7	7880995-7	MORALES ORTEGA XIMENA 	moralesortegaximena@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			MORALES ORTEGA XIMENA 	7880995-7	t	2025-08-17 03:19:07.438034
7488f26d-1867-4a1b-b01e-ff65afa56180	10667615-1	GALLO DE LA NOI MARIA SOLEDAD 	gallodelanoimariasoledad@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			GALLO DE LA NOI MARIA SOLEDAD 	10667615-1	t	2025-08-17 03:19:07.630872
4c9e25a8-db3d-4871-a24f-b8a91d3fa0e1	8754875-9	SQUELLA BOERR FREDDY 	squellaboerrfreddy@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			SQUELLA BOERR FREDDY 	8754875-9	t	2025-08-17 03:19:08.144001
91531f12-4bcd-4d26-840e-1bafc05963ad	51270348-K	51270348	51270348@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51270348	51270348-K	t	2025-08-17 01:50:40.07777
81e62f53-22c8-49c9-b749-f8929f3e82b2	51270360-K	51270360	51270360@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51270360	51270360-K	t	2025-08-17 01:50:44.188843
dcdc8450-93fe-4a33-8410-7294e1a60186	51266247-K	51266247	51266247@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51266247	51266247-K	t	2025-08-17 01:50:48.836813
8d81376f-068f-43fb-b88b-60b0f9b384dd	51271128-K	51271128	51271128@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51271128	51271128-K	t	2025-08-17 01:50:53.309924
abf2b761-f121-43bb-aeb5-c2d1da9c8ec5	51266705-K	51266705	51266705@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51266705	51266705-K	t	2025-08-17 01:50:57.868096
3ac0a919-6eca-48b8-9ff0-c3f8d169d924	51268428-K	51268428	51268428@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51268428	51268428-K	t	2025-08-17 01:51:02.471134
0b8a741f-f61b-4342-b95e-67f4d7e00c65	51271563-K	51271563	51271563@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51271563	51271563-K	t	2025-08-17 01:51:07.997733
2429e44a-48bc-4843-83d6-30f48433ef4b	51272297-K	51272297	51272297@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51272297	51272297-K	t	2025-08-17 01:51:12.2761
14c8aab3-991d-4ba4-966f-e6cac638f254	51263448-K	51263448	51263448@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51263448	51263448-K	t	2025-08-17 01:51:16.383355
e593fe4d-e100-431d-9659-775f1faacb01	51269234-K	51269234	51269234@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51269234	51269234-K	t	2025-08-17 01:51:20.473446
f830b554-66d5-438b-b8b7-e67b466c9a46	51267896-K	51267896	51267896@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267896	51267896-K	t	2025-08-17 01:51:24.574409
5d64b287-7536-47d9-a635-eb8c511800e6	51267908-K	51267908	51267908@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267908	51267908-K	t	2025-08-17 01:51:28.728915
e736380a-15fb-42e4-b34e-87e3e57bd5a9	8511116-7	LEON APPELGREN MAURICIO 	leonappelgrenmauricio@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			LEON APPELGREN MAURICIO 	8511116-7	t	2025-08-17 03:19:14.313665
86364a7b-e8e7-45cf-8c6f-1dd8bfd342d7	12496152-1	GARCIA PALOMINOS VICTOR RODRIGO	garciapalominosvictorrodrigo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			GARCIA PALOMINOS VICTOR RODRIGO	12496152-1	t	2025-08-17 03:19:14.628356
4ace5b42-91e3-498e-8636-d1c314af9a1e	10985370-4	PEREZ CORVALAN CRISTIAN ENRIQUE	perezcorvalancristianenrique@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			PEREZ CORVALAN CRISTIAN ENRIQUE	10985370-4	t	2025-08-17 03:19:14.823223
d4a97056-407b-4e3b-823c-e980622adfa3	11813948-8	SOTO ARANCIBIA ALEJANDRO VLADIMIR	sotoarancibiaalejandrovladimir@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			SOTO ARANCIBIA ALEJANDRO VLADIMIR	11813948-8	t	2025-08-17 03:19:15.274359
11893830-53ed-4f91-a97d-d52dde6c839b	5510614-2	URRIOLA BARRERA PATRICIA 	urriolabarrerapatricia@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			URRIOLA BARRERA PATRICIA 	5510614-2	t	2025-08-17 03:19:19.077713
9eabf749-2a0e-48af-ac69-826e13a2d24b	14548438-3	BEGAZO GONZALEZ ARNULFO PEDRO	begazogonzalezarnulfopedro@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			BEGAZO GONZALEZ ARNULFO PEDRO	14548438-3	t	2025-08-17 03:19:27.812996
523e3dde-c092-4af8-8b9e-ebbb9bc526ce	14658923-5	ANTEZANA BILBAO LA VIEJA GONZALO 	antezanabilbaolaviejagonzalo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ANTEZANA BILBAO LA VIEJA GONZALO 	14658923-5	t	2025-08-17 03:19:28.83408
7002bba5-d32e-470a-991b-8dbd5905960d	17085555-8	RODRIGUEZ NAVAS LIA FRANCISCA	rodrigueznavasliafrancisca@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			RODRIGUEZ NAVAS LIA FRANCISCA	17085555-8	t	2025-08-17 03:19:29.267629
f6b3a3de-59a3-42e0-b5d4-f9c3a0432e55	17516156-2	PAREDES VALENZUELA SEBASTIAN 	paredesvalenzuelasebastian@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			PAREDES VALENZUELA SEBASTIAN 	17516156-2	t	2025-08-17 03:19:29.948489
b351fec8-0230-435c-ba68-c004780afc36	13009265-9	MARTINEZ FERNANDEZ HUGO LEONARDO 	martinezfernandezhugoleonardo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			MARTINEZ FERNANDEZ HUGO LEONARDO 	13009265-9	t	2025-08-17 03:19:36.180652
5095249b-c995-4be4-b2a0-b765073f70f9	5761004-2	VASQUEZ BARRAZA MAURICIO 	vasquezbarrazamauricio@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			VASQUEZ BARRAZA MAURICIO 	5761004-2	t	2025-08-17 03:19:40.492115
d347d448-d5c8-4ea1-abe1-949c91f0b744	6663485-K	MARTINEZ NAZAR JAIME 	martineznazarjaime@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			MARTINEZ NAZAR JAIME 	6663485-K	t	2025-08-17 03:19:46.467909
b6132c3f-f843-4545-bc3f-be9a852ba906	6478554-0	CARTES UJEVICH MARIA FANNY	cartesujevichmariafanny@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CARTES UJEVICH MARIA FANNY	6478554-0	t	2025-08-17 03:19:47.034257
044f8999-a196-4e9b-8959-743ca225f66e	26574641-1	DIAZ MORENO FREDDY 	diazmorenofreddy@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			DIAZ MORENO FREDDY 	26574641-1	t	2025-08-17 03:19:49.020686
f1b72609-942b-4637-a097-f8ccbde6354a	8983743-K	MADARIAGA ROMO RICARDO 	madariagaromoricardo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			MADARIAGA ROMO RICARDO 	8983743-K	t	2025-08-17 03:19:49.568139
d01d9877-4492-44a3-b4c9-fb6349a8e35e	7921002-1	KUZMICIC CALDERON BORIS BOGDAN	kuzmiciccalderonborisbogdan@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			KUZMICIC CALDERON BORIS BOGDAN	7921002-1	t	2025-08-17 03:19:49.762753
8fe78ad3-8d70-4440-b605-1a7fc3b28e8f	27682545-3	PEREZ BALIÑO PABLO 	perezbaliopablo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			PEREZ BALIÑO PABLO 	27682545-3	t	2025-08-17 03:19:49.957409
112954ce-f05c-46d9-9e54-563a6f7365a4	15337551-8	HERNANDEZ CANALES DANIELA 	hernandezcanalesdaniela@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			HERNANDEZ CANALES DANIELA 	15337551-8	t	2025-08-17 03:19:54.03837
803d97a9-e587-4e89-be2c-4686c577faee	14257311-3	DIAZ BARRA ANDREA MARIANELLA	diazbarraandreamarianella@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			DIAZ BARRA ANDREA MARIANELLA	14257311-3	t	2025-08-17 03:19:54.391149
70333e9d-f679-4963-8dcc-bd3737785be5	10790872-2	STUARDO ARENAS PATRICIO 	stuardoarenaspatricio@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			STUARDO ARENAS PATRICIO 	10790872-2	t	2025-08-17 03:20:06.970239
1c25433f-183f-44c0-8c89-29b8e40f4386	9122363-5	CASTRO COURBIS JUAN PABLO	castrocourbisjuanpablo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CASTRO COURBIS JUAN PABLO	9122363-5	t	2025-08-17 03:20:12.905747
6f3f9d9e-04cb-48c0-834f-e854303fdf8c	13665545-0	TAPIA ÑANCUVILU CARLOS ENRIQUE	tapiaancuvilucarlosenrique@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			TAPIA ÑANCUVILU CARLOS ENRIQUE	13665545-0	t	2025-08-17 03:20:14.299661
b8df3a19-ea4c-4b0c-abec-8bd2ac9df474	15637640-K	CHIANG ODEH FRANCISCO JOSE	chiangodehfranciscojose@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			CHIANG ODEH FRANCISCO JOSE	15637640-K	t	2025-08-17 03:20:14.903686
227a932e-1bde-454d-ab9c-6a93271069d6	10800779-6	VERDUGO PALMA EDUARDO ENRIQUE	verdugopalmaeduardoenrique@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			VERDUGO PALMA EDUARDO ENRIQUE	10800779-6	t	2025-08-17 03:20:15.106185
438252bf-e9a4-465e-871e-623370357b6a	16066010-4	PEÑAILILLO BONACICH PABLO 	peailillobonacichpablo@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			PEÑAILILLO BONACICH PABLO 	16066010-4	t	2025-08-17 03:20:15.306662
6b91bc8e-cf45-4f22-bafe-18ecf33957c9	51270349-K	51270349	51270349@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51270349	51270349-K	t	2025-08-17 01:50:40.425036
0aa98d0a-93ce-4c4a-97f4-37f2bf7169ce	51270361-K	51270361	51270361@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51270361	51270361-K	t	2025-08-17 01:50:44.560437
ae90ca77-eb59-4f04-a358-e64f5fea6590	51266248-K	51266248	51266248@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51266248	51266248-K	t	2025-08-17 01:50:49.206431
17f5af7b-13a8-4308-9df3-5e313bb84b13	51271129-K	51271129	51271129@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51271129	51271129-K	t	2025-08-17 01:50:53.687133
386ff137-b844-4ad0-a0f7-14cef9bb386e	51269783-K	51269783	51269783@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51269783	51269783-K	t	2025-08-17 01:50:58.23179
53b72585-47bf-48d1-abc2-b372223ff008	51268429-K	51268429	51268429@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51268429	51268429-K	t	2025-08-17 01:51:02.854508
9f22dbd1-30d8-4e1e-9461-238ca6d70ce9	51272286-K	51272286	51272286@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51272286	51272286-K	t	2025-08-17 01:51:08.372404
36b0a6cb-4f3c-4258-b04e-981526816713	51267184-K	51267184	51267184@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267184	51267184-K	t	2025-08-17 01:51:16.71891
d17e8ab7-157b-4409-8fd8-cb3cd3df97b1	51269235-K	51269235	51269235@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51269235	51269235-K	t	2025-08-17 01:51:20.81242
7dbe7081-867e-47df-b115-9a17a1bd5863	51267897-K	51267897	51267897@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267897	51267897-K	t	2025-08-17 01:51:24.921211
013a0c7c-8154-42a2-a1f3-04c9544440b2	51267909-K	51267909	51267909@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267909	51267909-K	t	2025-08-17 01:51:29.077937
34c1a87a-eac5-47e9-9a69-c57597e666e1	12969248-0	SALAZAR CAMPOS MARCO ANTONIO	salazarcamposmarcoantonio@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			SALAZAR CAMPOS MARCO ANTONIO	12969248-0	t	2025-08-17 03:20:15.61725
35cf9878-380e-4a44-9589-bbd98c658cdc	18305814-2	PRATS PEÑA MARIA CARLA 	pratspeamariacarla@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			PRATS PEÑA MARIA CARLA 	18305814-2	t	2025-08-17 03:20:15.810428
d1c6cb7b-fdf1-48c6-a9aa-0f77524d7fc4	10040726-4	GUTIERREZ BORQUEZ DANIELA ALEJANDRA	gutierrezborquezdanielaalejandra@hospital.cl		esp_1755400817653	\N	\N	\N	individual	\N	\N	transfer			GUTIERREZ BORQUEZ DANIELA ALEJANDRA	10040726-4	t	2025-08-17 03:20:17.709909
54c25671-7de8-4ec9-b936-830533ddf921	26091826-5	DARDIK D DAN 	dardikddan@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			DARDIK D DAN 	26091826-5	t	2025-08-17 03:20:18.141603
f776ede8-d402-4377-bceb-84338448c761	7465120-8	OYARZUN NEUMANN ELEANA 	oyarzunneumanneleana@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			OYARZUN NEUMANN ELEANA 	7465120-8	t	2025-08-17 03:20:22.191874
6909acf2-0b21-451c-8c88-75454af62654	7186502-9	REYES OGAZ VIVIANA 	reyesogazviviana@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			REYES OGAZ VIVIANA 	7186502-9	t	2025-08-17 03:20:22.423306
8de8a565-5933-411b-a80b-1f1e9c47c18d	6796408-K	AVAYU HIRNHEIMER ESTER IDA	avayuhirnheimeresterida@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			AVAYU HIRNHEIMER ESTER IDA	6796408-K	t	2025-08-17 03:20:22.616472
e478f9c3-5df1-4d25-bae1-2ce9723d7e3a	6610530-K	PARROCHIA SEGOVIA SILVIA 	parrochiasegoviasilvia@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			PARROCHIA SEGOVIA SILVIA 	6610530-K	t	2025-08-17 03:20:22.80876
2c85c611-98ce-43c3-ad85-83ae3053625b	5827239-6	RAMIREZ CARVAJAL RUBEN DARIO	ramirezcarvajalrubendario@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			RAMIREZ CARVAJAL RUBEN DARIO	5827239-6	t	2025-08-17 03:20:23.048795
03cbe9ac-edc9-48f3-8297-7e75873371c6	22582401-0	GUERRERO NAVARRO BEYKY 	guerreronavarrobeyky@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			GUERRERO NAVARRO BEYKY 	22582401-0	t	2025-08-17 03:20:23.281076
e8e52188-9c9f-4bdc-901e-80e80ebd9136	10784314-0	VASQUEZ ULLOA PATRICIO 	vasquezulloapatricio@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			VASQUEZ ULLOA PATRICIO 	10784314-0	t	2025-08-17 03:20:29.456928
b0731f2d-0537-4e32-8c96-34c66302b607	7939525-0	GUTIERREZ PINTO JORGE ARMANDO	gutierrezpintojorgearmando@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			GUTIERREZ PINTO JORGE ARMANDO	7939525-0	t	2025-08-17 03:20:35.208314
fcc7e46d-6008-42ae-be12-858496cb80ee	6979680-K	JANKELEVICH ROZENTAL JACOBO 	jankelevichrozentaljacobo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			JANKELEVICH ROZENTAL JACOBO 	6979680-K	t	2025-08-17 03:20:35.526621
b107b30b-416a-4618-91fd-4b61eb574efc	15383065-7	ALBERTZ AREVALO NICOLAS 	albertzarevalonicolas@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ALBERTZ AREVALO NICOLAS 	15383065-7	t	2025-08-17 03:20:46.630303
44b493d3-3099-4fa5-88f5-372eded010b1	14460937-9	PAREDES POLAR MONICA GRACE	paredespolarmonicagrace@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			PAREDES POLAR MONICA GRACE	14460937-9	t	2025-08-17 03:20:47.535564
f08ed56c-ceb5-41dd-9d24-ec58ae0dff8a	15589965-4	SEPULVEDA HERMOSILLA FRANCISCO 	sepulvedahermosillafrancisco@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			SEPULVEDA HERMOSILLA FRANCISCO 	15589965-4	t	2025-08-17 03:20:52.59943
35bf571d-4b1e-4163-980a-ce96e35cc618	6473399-0	BALADRON BALTIERRA MARIO ENRIQUE	baladronbaltierramarioenrique@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			BALADRON BALTIERRA MARIO ENRIQUE	6473399-0	t	2025-08-17 03:20:52.9172
fce2a8fb-bde1-4ddd-8ffa-e8808d5192c8	7314739-5	JIJENA DE SOLMINIHAC MARIA ANGELICA 	jijenadesolminihacmariaangelica@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			JIJENA DE SOLMINIHAC MARIA ANGELICA 	7314739-5	t	2025-08-17 03:20:53.476601
ab4d79b0-21d3-4baa-bfbd-8aece2ff22bd	13200957-0	GANA HERVIAS ALEJANDRO 	ganaherviasalejandro@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			GANA HERVIAS ALEJANDRO 	13200957-0	t	2025-08-17 03:20:54.228317
101dbf79-4e99-497d-b826-aa6982a3013c	13872640-1	VALLEJO PAEZ ROBERTO 	vallejopaezroberto@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			VALLEJO PAEZ ROBERTO 	13872640-1	t	2025-08-17 03:20:54.423242
99f27cc1-fc54-4231-99e3-fe6ad63d6cfc	27034094-6	SALCEDO RODRIGUEZ AMILCAR JOSE	salcedorodriguezamilcarjose@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			SALCEDO RODRIGUEZ AMILCAR JOSE	27034094-6	t	2025-08-17 03:20:57.873263
cb5dbef3-9b7c-4f51-bb28-6c04fd2d7ce7	17603310-K	ROJAS LIZANA DANIEL ALEJANDRO	rojaslizanadanielalejandro@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ROJAS LIZANA DANIEL ALEJANDRO	17603310-K	t	2025-08-17 03:21:03.830087
69690f14-f569-4644-9023-26fe9c861822	14499890-1	ESPINOSA LARA CAROLINA ISABEL	espinosalaracarolinaisabel@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			ESPINOSA LARA CAROLINA ISABEL	14499890-1	t	2025-08-17 03:21:08.233617
490ea1b9-93c6-44f5-a49c-019776bbeffd	15422317-7	RAMIREZ PIZARRO TAMARA 	ramirezpizarrotamara@hospital.cl		esp_1755400817653	\N	\N	\N	individual	\N	\N	transfer			RAMIREZ PIZARRO TAMARA 	15422317-7	t	2025-08-17 03:21:10.486266
7cf70b5b-42ec-497d-a79f-f217659424ac	16471639-2	CARRASCO CANCINO CAROLINA 	carrascocancinocarolina@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CARRASCO CANCINO CAROLINA 	16471639-2	t	2025-08-17 03:43:23.568443
894905f2-d69c-493f-8602-72cecc35bd43	17956679-6	RODRIGUEZ HOTT FERNANDA 	rodriguezhottfernanda@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			RODRIGUEZ HOTT FERNANDA 	17956679-6	t	2025-08-17 03:43:25.227659
9673ecaa-8c5f-4077-b748-c76bb685d017	51270350-K	51270350	51270350@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51270350	51270350-K	t	2025-08-17 01:50:40.777878
7ec92595-a520-4a5c-aff6-01a30d3d3226	51265232-K	51265232	51265232@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51265232	51265232-K	t	2025-08-17 01:50:44.929385
b69322ff-218f-454a-a69b-12ad0d2f31c9	51271393-K	51271393	51271393@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51271393	51271393-K	t	2025-08-17 01:50:49.582824
198e60c0-15f3-4f9f-b725-8200f94c042c	51271130-K	51271130	51271130@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51271130	51271130-K	t	2025-08-17 01:50:54.081196
f6b48c85-3529-42a5-ae4b-c7261bdf1360	51269784-K	51269784	51269784@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51269784	51269784-K	t	2025-08-17 01:50:58.622445
2ce90df1-0d4f-41df-ad40-f4ee77e6c59b	51268430-K	51268430	51268430@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51268430	51268430-K	t	2025-08-17 01:51:04.241132
055568dd-4ab8-4c68-b40d-bd9db63f8de7	51272287-K	51272287	51272287@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51272287	51272287-K	t	2025-08-17 01:51:08.744099
9d563626-1bfc-4028-9e52-012922464108	51263438-K	51263438	51263438@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51263438	51263438-K	t	2025-08-17 01:51:12.961344
b8a5a5e4-d715-4699-a0d9-54b20da237cd	51267185-K	51267185	51267185@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267185	51267185-K	t	2025-08-17 01:51:17.054631
10363bf5-eb15-413d-8124-c5ced2dc54ff	51269236-K	51269236	51269236@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51269236	51269236-K	t	2025-08-17 01:51:21.14957
e87ef2c1-c4ab-4bf7-b3c4-8270a1db3c00	51267898-K	51267898	51267898@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267898	51267898-K	t	2025-08-17 01:51:25.268357
62d0a76c-363d-42a4-a5a3-5a5397d8850a	51267910-K	51267910	51267910@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267910	51267910-K	t	2025-08-17 01:51:29.421271
2eb1afc6-4c38-4edf-99ff-12c50ad0cdf2	16357231-1	ASTORGA ALVAREZ ROSA 	astorgaalvarezrosa@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ASTORGA ALVAREZ ROSA 	16357231-1	t	2025-08-17 03:21:17.55089
04807800-a289-45c4-b605-12045cd67538	15451046-K	VISCARRA CABRERA JORGE 	viscarracabrerajorge@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			VISCARRA CABRERA JORGE 	15451046-K	t	2025-08-17 03:43:25.581858
b0887413-e206-4af5-b73b-530eb0b4f48a	17537056-0	SEMINARIO AVILA MIGUEL RICARDO	seminarioavilamiguelricardo@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			SEMINARIO AVILA MIGUEL RICARDO	17537056-0	t	2025-08-17 03:43:25.897718
65f6ff60-5f03-4358-a6c4-7689eac5f428	15936778-9	VELOSO MUÑOZ GONZALO RODRIGO	velosomuozgonzalorodrigo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			VELOSO MUÑOZ GONZALO RODRIGO	15936778-9	t	2025-08-17 03:43:31.868264
15eeb287-49ca-4fb8-8232-4a01f1f5c0cc	16870716-9	AGUILA TAPIA FRANCISCO JOSE	aguilatapiafranciscojose@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			AGUILA TAPIA FRANCISCO JOSE	16870716-9	t	2025-08-17 03:43:32.305551
13771045-eff0-4268-aecd-8b781735b88e	18307645-0	PARADA IGLESIAS LUIS FELIPE	paradaiglesiasluisfelipe@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			PARADA IGLESIAS LUIS FELIPE	18307645-0	t	2025-08-17 03:43:33.25217
f034c0b2-12ab-478d-b352-8c6e897b95be	17270871-4	BASTIAS CAMPOS CAMILA FRANCISCA	bastiascamposcamilafrancisca@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			BASTIAS CAMPOS CAMILA FRANCISCA	17270871-4	t	2025-08-17 03:43:34.412742
4342ae03-e65c-43e4-8c49-ea35959da458	9833266-9	OLGUIN LEIVA RICARDO ALEJANDRO	olguinleivaricardoalejandro@hospital.cl		esp_1755400817653	\N	\N	\N	individual	\N	\N	transfer			OLGUIN LEIVA RICARDO ALEJANDRO	9833266-9	t	2025-08-17 03:43:36.559715
f1c3f7b5-e63a-4a4a-867c-fdae76886714	5941811-4	VADULLI ZELADA ANAMARIA 	vadullizeladaanamaria@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			VADULLI ZELADA ANAMARIA 	5941811-4	t	2025-08-17 03:43:39.826198
a93bc057-4a1c-4d56-bc4b-e9fbb3101800	16354439-3	RIVERA ROA FRANCISCO JAVIER	riveraroafranciscojavier@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			RIVERA ROA FRANCISCO JAVIER	16354439-3	t	2025-08-17 03:43:47.434754
32ccc1c7-7da8-45fc-9b53-bad2de135f40	12611629-2	ASTUDILLO ARANCIBIA MARCELA A.	astudilloarancibiamarcelaa@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ASTUDILLO ARANCIBIA MARCELA A.	12611629-2	t	2025-08-17 03:43:57.403504
0339b1fd-1236-4e13-990a-e8c1228e02f2	15542001-4	MOYA GONZALEZ NICOLAS 	moyagonzaleznicolas@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			MOYA GONZALEZ NICOLAS 	15542001-4	t	2025-08-17 03:44:32.235036
54edd4ba-1f51-4c7a-8116-ea66c2d6708d	13254807-2	NACRUR ROJAS EDUARDO ABRAAM	nacrurrojaseduardoabraam@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			NACRUR ROJAS EDUARDO ABRAAM	13254807-2	t	2025-08-17 03:44:34.276419
33610d94-a60e-42b2-8336-f42e51e5107b	10057775-5	CORDOVA SILVA OSVALDO 	cordovasilvaosvaldo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CORDOVA SILVA OSVALDO 	10057775-5	t	2025-08-17 03:44:42.1534
4a0b1040-6fad-411a-843e-1ffac7df67b1	17603249-9	CEVALLOS BRAVO CAROLINA ANDREA	cevallosbravocarolinaandrea@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CEVALLOS BRAVO CAROLINA ANDREA	17603249-9	t	2025-08-17 03:44:42.382786
31f230c0-2ac8-4160-bba9-91737571955d	16886926-6	MALDONADO MENDOZA CATALINA 	maldonadomendozacatalina@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			MALDONADO MENDOZA CATALINA 	16886926-6	t	2025-08-17 03:44:43.29469
c9783771-ea4c-4d2a-9685-4b1176d92f9a	17030222-2	RIQUELME PADRON JOSE PABLO 	riquelmepadronjosepablo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			RIQUELME PADRON JOSE PABLO 	17030222-2	t	2025-08-17 03:44:56.417671
cbd208ee-9ff4-42ce-8ffa-b75ff029c83b	9047242-9	CIFUENTES RECONDO JAVIER 	cifuentesrecondojavier@hospital.cl		esp_1755400817653	\N	\N	\N	individual	\N	\N	transfer			CIFUENTES RECONDO JAVIER 	9047242-9	t	2025-08-17 03:45:11.351444
53837a9a-64ac-4b01-b2d7-6ecbb49b7bee	10763868-7	LEON BONZI LORENA ANDREA	leonbonzilorenaandrea@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			LEON BONZI LORENA ANDREA	10763868-7	t	2025-08-17 03:45:26.120605
3dd82d39-e97d-4b07-8b76-92f8943a705a	7540422-0	MARQUEZ CARVAJAL SYLVIA IVONNE	marquezcarvajalsylviaivonne@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			MARQUEZ CARVAJAL SYLVIA IVONNE	7540422-0	t	2025-08-17 03:45:26.438201
17931321-5ac5-4876-bbdc-389cdda99377	13662971-9	SALGADO ALBORNOZ LORETO DEL	salgadoalbornozloretodel@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			SALGADO ALBORNOZ LORETO DEL	13662971-9	t	2025-08-17 03:45:50.704703
05210ee8-0a9f-49a2-b8ee-eeb800c15226	23514795-5	RODRIGUEZ CARLIN ARQUIMEDES 	rodriguezcarlinarquimedes@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			RODRIGUEZ CARLIN ARQUIMEDES 	23514795-5	t	2025-08-17 03:45:51.272834
095006a3-8530-4df1-8ee0-4a4305825aa6	6050276-5	VAZQUEZ LAGOS MARIA LUCY	vazquezlagosmarialucy@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			VAZQUEZ LAGOS MARIA LUCY	6050276-5	t	2025-08-17 03:45:52.070334
412fc46d-c66e-489f-adc4-a81847ea1074	10892314-8	MELIBOSKY RAMOS FRANCISCO MIGUEL	meliboskyramosfranciscomiguel@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			MELIBOSKY RAMOS FRANCISCO MIGUEL	10892314-8	t	2025-08-17 03:45:53.031995
9bf64eab-6dcd-4e33-9ff9-16914b4bcaee	12659486-0	JORQUERA AGUILERA RENE ANDRES	jorqueraaguilerareneandres@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			JORQUERA AGUILERA RENE ANDRES	12659486-0	t	2025-08-17 03:45:53.231954
d779b448-f38f-42f5-8c36-2c5cd5c8f4f8	51270351-K	51270351	51270351@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51270351	51270351-K	t	2025-08-17 01:50:41.126802
8e8249af-81c3-4db5-b134-00bc912c5c80	51265233-K	51265233	51265233@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51265233	51265233-K	t	2025-08-17 01:50:45.294003
5e39c112-5286-4ae4-b6d4-63ca053970bb	51271394-K	51271394	51271394@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51271394	51271394-K	t	2025-08-17 01:50:49.978323
d36e9ffe-25ab-424d-9158-524b7367c970	51271131-K	51271131	51271131@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51271131	51271131-K	t	2025-08-17 01:50:54.450511
fc0b3d7f-b052-4d1e-b51d-3094da0ff4f9	51269785-K	51269785	51269785@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51269785	51269785-K	t	2025-08-17 01:50:59.003235
3c401e57-ddae-4549-81e6-588790c954d4	51268431-K	51268431	51268431@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51268431	51268431-K	t	2025-08-17 01:51:04.616879
d2948cc1-8746-4788-b104-366816cc6078	51272288-K	51272288	51272288@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51272288	51272288-K	t	2025-08-17 01:51:09.124261
18f47c98-fccd-4e47-bdc8-d3e6dc56ac26	51263439-K	51263439	51263439@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51263439	51263439-K	t	2025-08-17 01:51:13.302136
cbbbfa7b-3dc6-4f40-ad14-a540e1f6c031	51267186-K	51267186	51267186@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267186	51267186-K	t	2025-08-17 01:51:17.388559
200baa9d-9cfb-4d85-b4f6-1167f4f5bf37	51269237-K	51269237	51269237@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51269237	51269237-K	t	2025-08-17 01:51:21.494777
309bbc1a-0d1b-450a-bab9-9e9675d92b96	51267899-K	51267899	51267899@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267899	51267899-K	t	2025-08-17 01:51:25.612032
2aa23e2c-ac10-4de7-af0e-61b9ed5c708b	51267911-K	51267911	51267911@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267911	51267911-K	t	2025-08-17 01:51:29.766638
26476c13-602c-401e-ae87-b3ae3dffc3dc	9857394-1	CANALES TURPAUD PABLO 	canalesturpaudpablo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CANALES TURPAUD PABLO 	9857394-1	t	2025-08-17 03:35:53.810201
3ba466c1-da97-410f-94af-20416f37b39e	16812127-K	BAHAMONDES MOYA NATALIA 	bahamondesmoyanatalia@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			BAHAMONDES MOYA NATALIA 	16812127-K	t	2025-08-17 03:35:54.009354
5ed69921-63b1-4f4d-a66c-170d55edab64	13680237-2	PIZARRO JOFRE CAROLINA ANDREA	pizarrojofrecarolinaandrea@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			PIZARRO JOFRE CAROLINA ANDREA	13680237-2	t	2025-08-17 03:36:00.215848
d23b7d73-d0f2-486d-b9d7-7545a954eb70	10043128-9	FANTOBAL ROJAS ALEJANDRA CAROLINA	fantobalrojasalejandracarolina@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			FANTOBAL ROJAS ALEJANDRA CAROLINA	10043128-9	t	2025-08-17 03:36:00.994626
c7904af6-d465-4dbd-ab05-06973fc5206d	10021449-0	MENENDEZ ALVAREZ ALEJANDRA 	menendezalvarezalejandra@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			MENENDEZ ALVAREZ ALEJANDRA 	10021449-0	t	2025-08-17 03:36:01.347969
19a89c56-7ee0-4556-8ce7-a0c4b3f17110	16752164-9	GANA GONZALEZ ERIC 	ganagonzalezeric@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			GANA GONZALEZ ERIC 	16752164-9	t	2025-08-17 03:36:23.68293
ef3d68ab-e9dc-4cbb-bd24-eece752f6d1c	25388676-5	CARVAJAL MENA JOSUE HEHULCHER	carvajalmenajosuehehulcher@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CARVAJAL MENA JOSUE HEHULCHER	25388676-5	t	2025-08-17 03:36:23.880914
136bde75-e8fb-4459-af6d-daf0369d53a1	26061548-3	ESPINOZA ROMERO LENIS LOURDES	espinozaromerolenislourdes@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ESPINOZA ROMERO LENIS LOURDES	26061548-3	t	2025-08-17 03:36:24.197226
72f0d951-97bb-4826-b4e7-ad0deb04eb6a	11472102-6	ARNELLO VIVEROS MARIA FRANCISCA	arnelloviverosmariafrancisca@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ARNELLO VIVEROS MARIA FRANCISCA	11472102-6	t	2025-08-17 03:36:24.625493
d3be49df-a29d-4e3e-aacc-2c0178645d2d	22898593-7	ANGEL PEREIRA NATHALI 	angelpereiranathali@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			ANGEL PEREIRA NATHALI 	22898593-7	t	2025-08-17 03:36:36.622599
568749a4-66e2-4895-a263-8be29496fb85	15735751-4	MARTINEZ MARDONES MONICA 	martinezmardonesmonica@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			MARTINEZ MARDONES MONICA 	15735751-4	t	2025-08-17 03:36:36.853895
eb53cb97-0435-4e0b-9fad-a50596f6f845	11837478-9	ZEBALLOS COFRE JESSICA ESTER	zeballoscofrejessicaester@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			ZEBALLOS COFRE JESSICA ESTER	11837478-9	t	2025-08-17 03:36:37.04767
ca6e1529-e20c-4e16-90f7-56a692eacb83	17237358-5	VARGAS AYANCAN DIEGO FELIPE	vargasayancandiegofelipe@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			VARGAS AYANCAN DIEGO FELIPE	17237358-5	t	2025-08-17 03:36:37.677881
289e6592-dfaa-4023-991f-c32434188f04	13019527-K	VALDES ECHEVERRIA GLORIA RAQUEL 	valdesecheverriagloriaraquel@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			VALDES ECHEVERRIA GLORIA RAQUEL 	13019527-K	t	2025-08-17 03:36:41.64928
fff56306-99a8-480f-845e-ac3e80ae9755	9906641-5	JARA LETELIER DANIELA 	jaraletelierdaniela@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			JARA LETELIER DANIELA 	9906641-5	t	2025-08-17 03:36:42.803427
3b475ba2-5c60-4493-ade1-252daad7e7ca	9905449-2	GONZALEZ RUIZ LUIS PABLO	gonzalezruizluispablo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			GONZALEZ RUIZ LUIS PABLO	9905449-2	t	2025-08-17 03:36:42.997343
603b971b-1a4f-48f3-9c33-2ab759a747b4	8664827-K	SALIN VIZCARRA MARIA PAZ	salinvizcarramariapaz@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			SALIN VIZCARRA MARIA PAZ	8664827-K	t	2025-08-17 03:36:43.195494
f4f04896-8033-4aa2-8002-badc7af07d26	26190027-0	CHIANTERA DAO DANIELA ALEXANDRA	chianteradaodanielaalexandra@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CHIANTERA DAO DANIELA ALEXANDRA	26190027-0	t	2025-08-17 03:36:52.91217
79b883de-ecd7-4e00-b3db-4f35b9f35b2a	26154828-3	PEREZ ARIAS JOSE IGNACIO 	perezariasjoseignacio@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			PEREZ ARIAS JOSE IGNACIO 	26154828-3	t	2025-08-17 03:36:55.113848
e05e6092-6bdf-4a3e-9d59-762d77e993af	13907956-6	ARRIAGADA VALENZUELA CLAUDIO 	arriagadavalenzuelaclaudio@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ARRIAGADA VALENZUELA CLAUDIO 	13907956-6	t	2025-08-17 03:37:05.160236
4021b112-dad0-481b-a7a2-b103c36b8a06	13026211-2	VERA CABRERA DANIEL 	veracabreradaniel@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			VERA CABRERA DANIEL 	13026211-2	t	2025-08-17 03:37:16.665085
c5d68c17-fb01-47d3-b63c-24a22c397a63	17810199-4	OYARCE LOPEZ FERNANDA 	oyarcelopezfernanda@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			OYARCE LOPEZ FERNANDA 	17810199-4	t	2025-08-17 03:37:28.973835
6a83451e-e447-42ed-b051-c7343931db41	7189507-6	FREDERICKSEN GALLARDO ALFREDO 	fredericksengallardoalfredo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			FREDERICKSEN GALLARDO ALFREDO 	7189507-6	t	2025-08-17 03:37:32.410474
3c433844-4c3a-4d41-a3aa-9e9cbd6ff107	10712686-4	IBAÑEZ GALLARDO CONSTANZA ANDREA	ibaezgallardoconstanzaandrea@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			IBAÑEZ GALLARDO CONSTANZA ANDREA	10712686-4	t	2025-08-17 03:37:39.656207
1d1a392c-0558-4edb-8939-d5d176e8e877	12799228-2	TERRA VALDES RODRIGO MARCELO	terravaldesrodrigomarcelo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			TERRA VALDES RODRIGO MARCELO	12799228-2	t	2025-08-17 03:37:40.932882
6a4818f9-4f7d-4c1a-a9be-9727900eb9f1	8605198-2	GAJARDO LETELIER CLAUDIA V	gajardoletelierclaudiav@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			GAJARDO LETELIER CLAUDIA V	8605198-2	t	2025-08-17 03:37:50.535947
7a305a7c-f068-49b0-b5e6-d06cbc7f8184	51270352-K	51270352	51270352@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51270352	51270352-K	t	2025-08-17 01:50:41.474094
b3962c79-2690-4bf5-a139-9dd06de3d400	51265234-K	51265234	51265234@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51265234	51265234-K	t	2025-08-17 01:50:45.760729
85e43dfa-dd49-471a-903c-16120b12644c	51265240-K	51265240	51265240@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51265240	51265240-K	t	2025-08-17 01:50:50.345724
ed043939-9613-4e59-87fe-5d735df39c0e	51271132-K	51271132	51271132@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51271132	51271132-K	t	2025-08-17 01:50:54.844822
91fb555c-4d3b-4283-ad63-52cb53ffddf8	51269786-K	51269786	51269786@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51269786	51269786-K	t	2025-08-17 01:50:59.392715
7eb6a0ce-14b0-4d38-9a7c-e8e136de8e44	51268432-K	51268432	51268432@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51268432	51268432-K	t	2025-08-17 01:51:05.010417
558211b6-5cc3-446e-a0b4-a6ee33745b31	51272289-K	51272289	51272289@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51272289	51272289-K	t	2025-08-17 01:51:09.467784
4c5cb57c-bc8e-404a-9adb-1c86f43ab9c3	51263440-K	51263440	51263440@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51263440	51263440-K	t	2025-08-17 01:51:13.636202
799b1b27-7adb-4def-a20c-32a2724fba52	51269226-K	51269226	51269226@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51269226	51269226-K	t	2025-08-17 01:51:17.725554
5521890e-f66d-413a-a047-40e803ac256c	51267888-K	51267888	51267888@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267888	51267888-K	t	2025-08-17 01:51:21.832699
5e8d7722-8431-4cf8-a860-8b92286f80e3	51267900-K	51267900	51267900@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267900	51267900-K	t	2025-08-17 01:51:25.960618
03808bc9-7497-4be4-aed5-6318a184ad05	51267912-K	51267912	51267912@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267912	51267912-K	t	2025-08-17 01:51:30.121369
7d0b90b2-527e-4696-a54a-a194f13a2461	8270683-6	ANDRADE MICHILLANCA PATRICIA CECILIA	andrademichillancapatriciacecilia@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ANDRADE MICHILLANCA PATRICIA CECILIA	8270683-6	t	2025-08-17 03:37:50.85744
2bb2cf91-e7af-4a18-8cbe-e43a4fdf4dfa	7813812-2	CHANG RATHKAMP DANAI YANG-LING	changrathkampdanaiyangling@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CHANG RATHKAMP DANAI YANG-LING	7813812-2	t	2025-08-17 03:37:51.170692
ebcd6c48-08b5-4486-af30-92b0ef06ed10	16606910-6	CARVAJAL GAVILAN CONSTANZA 	carvajalgavilanconstanza@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CARVAJAL GAVILAN CONSTANZA 	16606910-6	t	2025-08-17 03:37:51.67765
98348af3-3ab5-4c53-a41f-f585e0d5e92e	14644782-1	MONTAÑO CALLEJAS IGNACIO 	montaocallejasignacio@hospital.cl		esp_1755400817653	\N	\N	\N	individual	\N	\N	transfer			MONTAÑO CALLEJAS IGNACIO 	14644782-1	t	2025-08-17 03:37:59.704838
c20331e7-0baf-4407-b4fe-603d855cccde	8760057-2	ALVARADO SOMMER CARMEN LUZ	alvaradosommercarmenluz@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ALVARADO SOMMER CARMEN LUZ	8760057-2	t	2025-08-17 03:38:14.952415
01a3daf9-b51e-435d-9dd8-387d5b01f6cd	7546501-7	PAOLINELLI GRUNET CARLO 	paolinelligrunetcarlo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			PAOLINELLI GRUNET CARLO 	7546501-7	t	2025-08-17 03:38:15.989509
a80fe296-89cf-4cb8-834c-ed91b181c16c	7018558-K	BOMBARDIERE ROSAS PEDRO 	bombardiererosaspedro@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			BOMBARDIERE ROSAS PEDRO 	7018558-K	t	2025-08-17 03:38:16.30046
61c90071-ddfa-4e64-9d43-23e0849da84a	5846836-3	CUEVAS BURGOS ANGELINA 	cuevasburgosangelina@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CUEVAS BURGOS ANGELINA 	5846836-3	t	2025-08-17 03:38:16.774419
e1f030fa-8e5a-4b67-a1ef-a13aa400c7a2	14445572-K	MUÑOZ ROSAS MARCELO 	muozrosasmarcelo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			MUÑOZ ROSAS MARCELO 	14445572-K	t	2025-08-17 03:39:01.485725
3ce28859-e99e-4677-8fd0-3b4cccd1c7d1	14532320-7	AYALA BOHORQUEZ JUAN CARLOS	ayalabohorquezjuancarlos@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			AYALA BOHORQUEZ JUAN CARLOS	14532320-7	t	2025-08-17 03:39:01.683074
75ee9b2d-0963-43e2-965b-5d8fef39845d	15095694-3	CALDERON DROGUETT PAULA ALEJANDRA	calderondroguettpaulaalejandra@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CALDERON DROGUETT PAULA ALEJANDRA	15095694-3	t	2025-08-17 03:39:02.000664
68f391ee-0a5e-4e55-85a3-65e73cf6d19a	25463294-5	SALAZAR GAMEZ LUIS ALFREDO	salazargamezluisalfredo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			SALAZAR GAMEZ LUIS ALFREDO	25463294-5	t	2025-08-17 03:39:02.32206
78296862-6f5b-40ca-86c6-6d90d23b3a76	15770926-7	CRUZ URRUTIA CRISTIAN 	cruzurrutiacristian@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CRUZ URRUTIA CRISTIAN 	15770926-7	t	2025-08-17 03:39:02.637415
edc51910-ecc0-4da4-b3ee-6cafc1451e99	26762828-9	ROLON . MATIAS GERARDO	rolonmatiasgerardo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ROLON . MATIAS GERARDO	26762828-9	t	2025-08-17 03:39:02.954422
9b693b59-5246-4161-b9e4-b6a368acd5ca	15097525-5	ZENTENO HOFER MACARENA DEL	zentenohofermacarenadel@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ZENTENO HOFER MACARENA DEL	15097525-5	t	2025-08-17 03:39:03.150333
598fa818-a028-480b-9f4d-67a5a292c157	12853879-8	ORREGO GUARDA ALEJANDRO 	orregoguardaalejandro@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ORREGO GUARDA ALEJANDRO 	12853879-8	t	2025-08-17 03:39:03.587633
6ea59c4c-43cb-4255-a3dd-e7bd8e3397a7	16379955-3	ALBORNOZ SERQUEIRA RODRIGO 	albornozserqueirarodrigo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ALBORNOZ SERQUEIRA RODRIGO 	16379955-3	t	2025-08-17 03:39:03.822422
a4763f18-2839-47b4-a2bf-a84f683e57c3	9552035-9	CAMPAÑA VILLEGAS GONZALO 	campaavillegasgonzalo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CAMPAÑA VILLEGAS GONZALO 	9552035-9	t	2025-08-17 03:39:04.0123
0fb78454-883a-42dd-83c4-faa8095ec42d	8475983-K	FERRON CONEJEROS SANDRA ANGELICA	ferronconejerossandraangelica@hospital.cl		esp_1755400817653	\N	\N	\N	individual	\N	\N	transfer			FERRON CONEJEROS SANDRA ANGELICA	8475983-K	t	2025-08-17 03:39:07.442228
0463d6ad-9d3c-4666-b97f-73797b9fd1b3	5316429-3	MORALES ITURRIZAGASTEGU RAUL 	moralesiturrizagasteguraul@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			MORALES ITURRIZAGASTEGU RAUL 	5316429-3	t	2025-08-17 03:39:25.816332
0027c15a-9a03-4c73-a7cf-5156e19165e0	24503889-5	ZSCHAECK LUZARDO CHRISTIANE 	zschaeckluzardochristiane@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ZSCHAECK LUZARDO CHRISTIANE 	24503889-5	t	2025-08-17 03:39:26.129204
6f77c0a0-76a2-4a5a-b36a-f35306be807e	23903604-K	ROMERO VARGAS ALVARO ANTONIO	romerovargasalvaroantonio@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ROMERO VARGAS ALVARO ANTONIO	23903604-K	t	2025-08-17 03:39:26.635364
2cf2495f-505f-4c7a-a9a5-91a3adad003e	17600101-1	CASTILLO BOMBARDIERE CAROLINA 	castillobombardierecarolina@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CASTILLO BOMBARDIERE CAROLINA 	17600101-1	t	2025-08-17 03:39:26.842004
e79943bd-8000-4478-ac34-fb9f882f757d	17408529-3	CUELLAR GUTIERREZ JAVIER IGNACIO	cuellargutierrezjavierignacio@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CUELLAR GUTIERREZ JAVIER IGNACIO	17408529-3	t	2025-08-17 03:39:27.050127
597c4a11-c451-48c6-8d74-c6434cdc863d	16958333-1	PARADA MONTENEGRO JAVIER IGNACIO	paradamontenegrojavierignacio@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			PARADA MONTENEGRO JAVIER IGNACIO	16958333-1	t	2025-08-17 03:39:27.514635
1c84717c-9edc-4286-862a-fbe46ed7f217	16672122-9	CARVAJAL GONZALEZ FRANCISCA 	carvajalgonzalezfrancisca@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CARVAJAL GONZALEZ FRANCISCA 	16672122-9	t	2025-08-17 03:39:28.002827
5e2648e9-16c6-450e-94da-c21a3a6950fd	51270353-K	51270353	51270353@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51270353	51270353-K	t	2025-08-17 01:50:41.806093
b0e50180-8781-4af0-b2ad-5d975b3605b7	51265235-K	51265235	51265235@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51265235	51265235-K	t	2025-08-17 01:50:46.130159
decb4c9e-fd53-4405-89bd-d7ad48cf414d	51271121-K	51271121	51271121@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51271121	51271121-K	t	2025-08-17 01:50:50.711007
2c756808-92a4-454b-a0bb-7db066519b18	51271133-K	51271133	51271133@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51271133	51271133-K	t	2025-08-17 01:50:55.213787
82df4bc8-438b-447b-a344-e6ae4c453c0c	51263997-K	51263997	51263997@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51263997	51263997-K	t	2025-08-17 01:50:59.783488
bca5d9f8-7611-45a8-8d46-6f965526741a	51268433-K	51268433	51268433@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51268433	51268433-K	t	2025-08-17 01:51:05.381598
c8f7f25b-c2b9-44fe-a878-d3bb42c892d0	51272290-K	51272290	51272290@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51272290	51272290-K	t	2025-08-17 01:51:09.828047
c5e25f6f-576c-4dad-bd2d-327a68c7718f	51263441-K	51263441	51263441@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51263441	51263441-K	t	2025-08-17 01:51:13.979996
99b9e64a-347c-47ed-8bd6-8f4634308b5a	51269227-K	51269227	51269227@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51269227	51269227-K	t	2025-08-17 01:51:18.070897
65d461c3-2514-46b2-8d04-cf3284764b74	51267889-K	51267889	51267889@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267889	51267889-K	t	2025-08-17 01:51:22.169689
39f27684-4140-42d6-b134-201dcb6e3866	51267901-K	51267901	51267901@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267901	51267901-K	t	2025-08-17 01:51:26.311164
8c712066-e97e-4856-8f5d-516c2af14e34	51267913-K	51267913	51267913@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			51267913	51267913-K	t	2025-08-17 01:51:30.504633
79101f7e-723f-4f90-8bdb-54e6aac9cf2f	16098617-4	LECAROS CORNEJO CRISTOBAL ANDRES	lecaroscornejocristobalandres@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			LECAROS CORNEJO CRISTOBAL ANDRES	16098617-4	t	2025-08-17 03:39:28.429299
63b89cc9-bc18-43a5-b7a1-d1fbfce26d6f	7292172-0	CARRASCO ACHONDO OSCAR 	carrascoachondooscar@hospital.cl		esp_1755400817653	\N	\N	\N	individual	\N	\N	transfer			CARRASCO ACHONDO OSCAR 	7292172-0	t	2025-08-17 03:40:04.377743
f55b1727-8f23-404b-a2a3-aa8d46c50a06	16657240-1	BALUT OYARZUN FERNANDA 	balutoyarzunfernanda@hospital.cl		esp_1755400817653	\N	\N	\N	individual	\N	\N	transfer			BALUT OYARZUN FERNANDA 	16657240-1	t	2025-08-17 03:40:04.606068
9fb85336-013c-4dbe-97f1-854b74d174f7	17405889-K	FUENZALIDA FRIEDERICHS CONSTANZA BEATR 	fuenzalidafriederichsconstanzabeatr@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			FUENZALIDA FRIEDERICHS CONSTANZA BEATR 	17405889-K	t	2025-08-17 03:40:15.639332
8a7bdf27-d6d7-43cf-8595-9573487bd7e7	10031235-2	PAULOS MONTENEGRO JAVIER ANDRES	paulosmontenegrojavierandres@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			PAULOS MONTENEGRO JAVIER ANDRES	10031235-2	t	2025-08-17 03:40:16.630307
9a206845-b7c8-4905-8105-fcb6d2156377	15643587-2	VILLAVICENCIO ACHURRA ALDO 	villavicencioachurraaldo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			VILLAVICENCIO ACHURRA ALDO 	15643587-2	t	2025-08-17 03:40:18.070089
5807c5b2-c820-4801-82e2-13390bb0db0a	13674228-0	SALINAS CARRASCO PABLO 	salinascarrascopablo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			SALINAS CARRASCO PABLO 	13674228-0	t	2025-08-17 03:40:36.140915
38a67a1c-7631-42fe-b644-d163416e031f	15492392-6	BRINTRUP CONCHA ROLDAN ESTEBAN	brintrupconcharoldanesteban@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			BRINTRUP CONCHA ROLDAN ESTEBAN	15492392-6	t	2025-08-17 03:40:39.725337
8852bc79-2fff-4ae3-a566-a1757953fb6a	15388573-7	CESPEDES JARA JESSICA ANDREA	cespedesjarajessicaandrea@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CESPEDES JARA JESSICA ANDREA	15388573-7	t	2025-08-17 03:40:39.91899
1a8ba94f-8670-421c-aeeb-b515e7e99a48	15327310-3	LIZANA CORVERA MANUEL ALEJANDRO	lizanacorveramanuelalejandro@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			LIZANA CORVERA MANUEL ALEJANDRO	15327310-3	t	2025-08-17 03:40:41.774434
00586af2-0551-42ba-af84-28bf205b1ccf	15271449-1	VASQUEZ SAAVEDRA FELIPE ANDRES	vasquezsaavedrafelipeandres@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			VASQUEZ SAAVEDRA FELIPE ANDRES	15271449-1	t	2025-08-17 03:40:41.967712
53787fe0-2965-4a46-9d1c-6b45fb6c7567	13831383-2	HOLUIGUE GALVEZ CARLA ANDREA	holuiguegalvezcarlaandrea@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			HOLUIGUE GALVEZ CARLA ANDREA	13831383-2	t	2025-08-17 03:40:42.202305
47ea83cb-5b3f-474f-8a2a-e9f371ccabb8	6994009-9	OVALLE ANDRADE LORETO 	ovalleandradeloreto@hospital.cl		esp_1755400817653	\N	\N	\N	individual	\N	\N	transfer			OVALLE ANDRADE LORETO 	6994009-9	t	2025-08-17 03:40:44.050571
72604323-917a-4005-a58c-8e3a76c28fc6	12485462-8	PIZARRO SOTO DANIEL GERMAN	pizarrosotodanielgerman@hospital.cl		esp_1755400817653	\N	\N	\N	individual	\N	\N	transfer			PIZARRO SOTO DANIEL GERMAN	12485462-8	t	2025-08-17 03:40:45.2088
cd3ad925-f844-40d1-b79c-51c83a2a1682	11616257-1	BACOVIC FANOLA LJUBOMIR IVAN	bacovicfanolaljubomirivan@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			BACOVIC FANOLA LJUBOMIR IVAN	11616257-1	t	2025-08-17 03:40:46.120948
c2982be3-84cf-4879-95f8-c31cd563a150	10634964-9	PAREDES QUINTEROS VICTORIA 	paredesquinterosvictoria@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			PAREDES QUINTEROS VICTORIA 	10634964-9	t	2025-08-17 03:40:57.503625
58d871bc-779e-493c-9f63-471923a49986	14742693-3	CARTALLIER , OTONE MIREILLE 	cartallierotonemireille@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CARTALLIER , OTONE MIREILLE 	14742693-3	t	2025-08-17 03:41:14.915629
4d7f40a7-87b6-4c8c-9819-190afa64c031	13473357-8	VILLALON POOLEY PAMELA VERONICA	villalonpooleypamelaveronica@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			VILLALON POOLEY PAMELA VERONICA	13473357-8	t	2025-08-17 03:41:53.370154
5646e72b-d0d1-4aa8-8b6f-a90abc03174a	13028216-4	CONTRERAS ESCOBAR CAROLINA ANDREA 	contrerasescobarcarolinaandrea@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CONTRERAS ESCOBAR CAROLINA ANDREA 	13028216-4	t	2025-08-17 03:41:53.801353
dee359d3-3be9-42f8-b93b-e67a4decfd50	8962880-6	SANCHEZ BERRIOS MARIA SOLEDAD	sanchezberriosmariasoledad@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			SANCHEZ BERRIOS MARIA SOLEDAD	8962880-6	t	2025-08-17 03:42:09.160634
213cccb0-af50-415a-b483-14e85a434bc0	8329299-7	MATUS IBARRA HELIA ELIZABETH	matusibarraheliaelizabeth@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			MATUS IBARRA HELIA ELIZABETH	8329299-7	t	2025-08-17 03:42:09.392021
e663efb7-e268-49e1-af5c-325af59feaea	9392853-9	VARGAS SANHUEZA RENATO 	vargassanhuezarenato@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			VARGAS SANHUEZA RENATO 	9392853-9	t	2025-08-17 03:42:10.23105
ff7facb5-c9fa-437b-8b6d-0ffc65aee4d9	7229213-8	CASTILLO DARVICH RODRIGO 	castillodarvichrodrigo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CASTILLO DARVICH RODRIGO 	7229213-8	t	2025-08-17 03:42:21.430622
e0d7c2a3-0b36-4449-ad8c-14ab6d519987	28057051-6	AGUERRE HOUDEK MARIA FLORENCIA 	aguerrehoudekmariaflorencia@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			AGUERRE HOUDEK MARIA FLORENCIA 	28057051-6	t	2025-08-17 03:42:22.417607
e36deb1a-4b82-4174-a9f5-5991009d33dc	9381152-6	SAN MARTIN MARDONEZ CLAUDIO 	sanmartinmardonezclaudio@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			SAN MARTIN MARDONEZ CLAUDIO 	9381152-6	t	2025-08-17 03:42:30.138954
d9c93119-fa30-4ffc-b40b-569557571066	9908152-K	SILVA WAISSBLUTH ANDRES DAVID	silvawaissbluthandresdavid@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			SILVA WAISSBLUTH ANDRES DAVID	9908152-K	t	2025-08-17 03:45:59.907404
3be893dd-b54e-41ca-ace3-5df856183203	8395219-9	ROBLES SEPULVEDA MICHELE CAROLINA	roblessepulvedamichelecarolina@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ROBLES SEPULVEDA MICHELE CAROLINA	8395219-9	t	2025-08-17 03:46:04.195726
8e26706a-7ea7-40d2-9c75-afe590ed4a6a	15677405-7	BERNAL RIQUELME JOSE OSVALDO	bernalriquelmejoseosvaldo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			BERNAL RIQUELME JOSE OSVALDO	15677405-7	t	2025-08-17 03:46:05.782196
55054ea2-4fac-40ff-bafe-a115911c3826	9959227-3	PRIETO URRUTIA JORGE 	prietourrutiajorge@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			PRIETO URRUTIA JORGE 	9959227-3	t	2025-08-17 03:46:14.069787
d347dcd2-9477-4fe2-a127-61e0843e1f51	17670849-2	REYES REYES GUILLERMO PATRICIO	reyesreyesguillermopatricio@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			REYES REYES GUILLERMO PATRICIO	17670849-2	t	2025-08-17 03:46:34.385327
82ac378c-eabf-48f4-86bb-c7664b7c723d	12834648-1	READI SAKURADA RAMON ANDRES 	readisakuradaramonandres@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			READI SAKURADA RAMON ANDRES 	12834648-1	t	2025-08-17 03:46:51.502504
d3a8e82c-3ec1-4c1d-a9bf-495423be7d0b	7339803-7	MARMENTINI SOBRINO ENZO 	marmentinisobrinoenzo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			MARMENTINI SOBRINO ENZO 	7339803-7	t	2025-08-17 03:46:52.294341
15af1d69-75be-4281-9e89-7a4c1265d1c4	20471880-6	OLGUIN ORELLANA ANTONIA 	olguinorellanaantonia@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			OLGUIN ORELLANA ANTONIA 	20471880-6	t	2025-08-17 03:47:02.803446
3b9975a2-8e7c-4c25-be91-ca482031b8ed	18021538-7	HORTAL FONTANET JOSEFINA 	hortalfontanetjosefina@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			HORTAL FONTANET JOSEFINA 	18021538-7	t	2025-08-17 03:47:02.998168
eab94a71-272c-49dc-80a7-eef51a09be98	7574223-1	VILLARROEL RAMOS ROSA VICTORIA	villarroelramosrosavictoria@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			VILLARROEL RAMOS ROSA VICTORIA	7574223-1	t	2025-08-17 03:47:10.245526
0949141a-93ec-4b34-87d1-5fc2619ddf1a	19160118-1	ALVARADO FUENTES MATIAS 	alvaradofuentesmatias@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ALVARADO FUENTES MATIAS 	19160118-1	t	2025-08-17 03:47:10.928524
7bbee342-3369-43e8-b539-cbadb738d2dc	18459422-6	CERON FABIO JAVIERA PAZ	ceronfabiojavierapaz@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CERON FABIO JAVIERA PAZ	18459422-6	t	2025-08-17 03:47:11.665153
b1384030-5936-43d7-8a48-e7387ee12105	13306452-4	OSORIO MALLEA JAIME ARTURO	osoriomalleajaimearturo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			OSORIO MALLEA JAIME ARTURO	13306452-4	t	2025-08-17 03:47:15.155272
991b08ea-800e-4ab9-afc7-e5d2d077120c	21387186-2	OCAMPO MENDOZA SARA 	ocampomendozasara@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			OCAMPO MENDOZA SARA 	21387186-2	t	2025-08-17 03:47:16.082571
d6929388-c451-49d9-b608-ea730caaff1d	10661853-4	HERNANDEZ TOLEDO BARBARA IVONNE	hernandeztoledobarbaraivonne@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			HERNANDEZ TOLEDO BARBARA IVONNE	10661853-4	t	2025-08-17 03:47:19.851522
a68f45c5-7d3e-426a-925b-be0fbee04f2b	17403254-8	PEMJEAN GALLEGUILLOS PHLIPPE ANDRES	pemjeangalleguillosphlippeandres@hospital.cl		esp_1755400817653	\N	\N	\N	individual	\N	\N	transfer			PEMJEAN GALLEGUILLOS PHLIPPE ANDRES	17403254-8	t	2025-08-17 03:47:34.086035
90d7f3c6-aa93-4237-a7a1-ae82e968c06b	9040183-1	GUZMAN OLIVARES JOSE 	guzmanolivaresjose@hospital.cl		esp_1755400817653	\N	\N	\N	individual	\N	\N	transfer			GUZMAN OLIVARES JOSE 	9040183-1	t	2025-08-17 03:47:34.904902
dc0059ea-46c7-48ec-93c1-6e54bcae8db4	9087759-3	BURGOS SIEGMUND NELSON 	burgossiegmundnelson@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			BURGOS SIEGMUND NELSON 	9087759-3	t	2025-08-17 03:47:42.79863
2f36b3c3-c1f3-4a2b-b43f-8cf38ca3e7e4	17822353-4	HERRERA DE LA FUENTE ANYA 	herreradelafuenteanya@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			HERRERA DE LA FUENTE ANYA 	17822353-4	t	2025-08-17 03:48:05.777425
7a946d44-d63c-4f43-bc68-dfdf93027736	16210466-7	TREBITSCH MEIROVICH KARINA YAEL 	trebitschmeirovichkarinayael@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			TREBITSCH MEIROVICH KARINA YAEL 	16210466-7	t	2025-08-17 03:48:06.725694
7e3871c8-04b4-4a98-a041-d25903081a4b	6372721-0	HINRICHSEN MOYA MONICA 	hinrichsenmoyamonica@hospital.cl		esp_1755400817653	\N	\N	\N	individual	\N	\N	transfer			HINRICHSEN MOYA MONICA 	6372721-0	t	2025-08-17 03:48:08.879478
14e74bdd-448f-441d-b5ea-432b820da471	27416269-4	LOPEZ JINETE DARUES 	lopezjinetedarues@hospital.cl		esp_1755400817653	\N	\N	\N	individual	\N	\N	transfer			LOPEZ JINETE DARUES 	27416269-4	t	2025-08-17 03:48:09.196048
43c2663b-4314-4593-8963-73e4681c6a93	13232080-2	CHAMORRO MONARDES YORDY ALBERTO 	chamorromonardesyordyalberto@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CHAMORRO MONARDES YORDY ALBERTO 	13232080-2	t	2025-08-17 03:48:18.443257
4ef31cd9-6566-41ed-bd07-bfcd9a87a823	14732483-9	CARDOZO LOZANO JOSE HARVEY	cardozolozanojoseharvey@hospital.cl		esp_1755400817653	\N	\N	\N	individual	\N	\N	transfer			CARDOZO LOZANO JOSE HARVEY	14732483-9	t	2025-08-17 03:48:46.868723
43467c8c-b50e-4c68-b251-4f5ea1e3ea51	15322279-7	ROMERO DOUGNAC BERNARDITA 	romerodougnacbernardita@hospital.cl		esp_1755400817653	\N	\N	\N	individual	\N	\N	transfer			ROMERO DOUGNAC BERNARDITA 	15322279-7	t	2025-08-17 03:48:47.952477
efd5d548-956f-4598-84dd-40c58317f19c	14573122-4	ZAMBRANO PEREZ ALEXSANDRA 	zambranoperezalexsandra@hospital.cl		esp_1755400817653	\N	\N	\N	individual	\N	\N	transfer			ZAMBRANO PEREZ ALEXSANDRA 	14573122-4	t	2025-08-17 03:48:48.275832
f0cbe482-3447-4cb7-bf5a-9d053394940e	26377766-2	GONZALEZ JARA KARLA 	gonzalezjarakarla@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			GONZALEZ JARA KARLA 	26377766-2	t	2025-08-17 03:49:00.020445
6ad46d4a-2e30-4983-aaf8-2e45f26a2c36	13515570-5	CIFUENTES AREVALO MELISSA ESTEFANIA	cifuentesarevalomelissaestefania@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CIFUENTES AREVALO MELISSA ESTEFANIA	13515570-5	t	2025-08-17 03:49:00.809049
893f5def-d91a-417e-88e7-ce17346186c7	5408132-4	CARVAJAL MORENO ANTONIO 	carvajalmorenoantonio@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			CARVAJAL MORENO ANTONIO 	5408132-4	t	2025-08-17 03:49:09.065525
49ff2a9a-ca34-4cd3-80dd-4ef317c7b575	16054848-7	ZUÑIGA VERA RODRIGO ARTURO	zuigaverarodrigoarturo@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			ZUÑIGA VERA RODRIGO ARTURO	16054848-7	t	2025-08-17 03:49:11.490169
f977bfdf-d8d5-43ba-9c22-8f4401be3aea	13876156-8	TABILO CASTILLO PATRICIO ANDRES	tabilocastillopatricioandres@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			TABILO CASTILLO PATRICIO ANDRES	13876156-8	t	2025-08-17 03:49:11.923571
61d621d3-84d9-4e1a-ba2b-f02f6aa27eed	10554847-8	OSSANDON SALAS ENRIQUE 	ossandonsalasenrique@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			OSSANDON SALAS ENRIQUE 	10554847-8	t	2025-08-17 03:49:12.118348
ca7dd100-7ee9-42b0-a372-aa0b2697c04f	15720129-8	DURAN PIZARRO DIEGO 	duranpizarrodiego@hospital.cl		esp_1755400627676	\N	\N	\N	individual	\N	\N	transfer			DURAN PIZARRO DIEGO 	15720129-8	t	2025-08-17 03:49:12.476649
c7efe120-1c06-415c-b89f-ff4b789b2ed3	17961907-5	OLIVA GUERRERO CAROLINA 	olivaguerrerocarolina@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			OLIVA GUERRERO CAROLINA 	17961907-5	t	2025-08-17 03:50:16.963892
59fa4b08-fef2-4ccc-8627-ecd7c2c71498	10514131-9	PLANDIURA VERGARA JOSE MIGUEL	plandiuravergarajosemiguel@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			PLANDIURA VERGARA JOSE MIGUEL	10514131-9	t	2025-08-17 03:50:17.645699
22913543-1fa0-445b-a036-a32108a9c91c	8197103-K	ZUÑIGA MOYA JAIME ALBERTO	zuigamoyajaimealberto@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			ZUÑIGA MOYA JAIME ALBERTO	8197103-K	t	2025-08-17 03:50:18.570581
7c9e00d3-33a6-498b-a6b7-dbd7a86b96e7	7755530-7	DEPAUX VEGA RUTH MARIA	depauxvegaruthmaria@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			DEPAUX VEGA RUTH MARIA	7755530-7	t	2025-08-17 03:50:19.145949
13cc597f-38bd-40bd-8685-4cbaeb3766b8	7933261-5	LIZAMA BEIZA MARCELO 	lizamabeizamarcelo@hospital.cl		esp013	\N	\N	\N	individual	\N	\N	transfer			LIZAMA BEIZA MARCELO 	7933261-5	t	2025-08-17 03:50:19.591983
093d559a-c031-4bdc-838e-ba894ae6e686	13292030-3	MARILEO ZAGAL ROBERTO 	marileozagalroberto@hospital.cl		esp001			\N	individual	\N	\N	transfer			MARILEO ZAGAL ROBERTO 	13292030-3	t	2025-08-17 03:17:04.557734
\.


--
-- Data for Name: insurance_types; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.insurance_types (id, code, name, description, created_at) FROM stdin;
\.


--
-- Data for Name: medical_centers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.medical_centers (id, name, address, phone, email, logo_url, created_at) FROM stdin;
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.services (id, code, name, description, participation_type, specialty_id, base_value, is_active, created_at) FROM stdin;
srv001	CON001	Consulta Cardiológica	Consulta médica especializada en cardiología	individual	esp001	\N	t	2025-08-05 02:09:28.561309
srv002	CON002	Consulta Neurológica	Consulta médica especializada en neurología	individual	esp002	\N	t	2025-08-05 02:09:28.561309
srv003	CON003	Consulta Pediátrica	Consulta médica especializada en pediatría	individual	esp003	\N	t	2025-08-05 02:09:28.561309
srv004	ECG001	Electrocardiograma	Registro de la actividad eléctrica del corazón	individual	esp001	\N	t	2025-08-05 02:09:28.561309
srv005	ECO001	Ecocardiograma	Estudio del corazón mediante ultrasonido	individual	esp001	\N	t	2025-08-05 02:09:28.561309
srv006	EEG001	Electroencefalograma	Registro de la actividad eléctrica cerebral	individual	esp002	\N	t	2025-08-05 02:09:28.561309
srv007	CIR001	Cirugía Cardiovascular	Procedimiento quirúrgico del corazón	society	esp001	\N	t	2025-08-05 02:09:28.561309
srv008	CIR002	Cirugía Neurológica	Procedimiento quirúrgico del sistema nervioso	society	esp002	\N	t	2025-08-05 02:09:28.561309
srv009	CON004	Consulta Ginecológica	Consulta médica especializada en ginecología	individual	esp004	\N	t	2025-08-05 02:09:28.561309
srv010	CON005	Consulta Traumatológica	Consulta médica especializada en traumatología	individual	esp005	\N	t	2025-08-05 02:09:28.561309
62ed45bd-f7af-4b77-933d-0fe2baaf3561	890125	Radiografia Torax	Servicio importado: Radiografia Torax	individual	\N	\N	t	2025-08-05 22:15:24.000484
9bd9c9a1-fc46-4a41-8d7d-7e6d67d92e28	890123	Consulta General	Servicio importado: Consulta General	individual	\N	\N	t	2025-08-05 22:15:24.40066
934847d2-72e7-40dd-a8bd-0c778df2bb57	890127	Consulta Especialista	Servicio importado: Consulta Especialista	individual	\N	\N	t	2025-08-05 22:15:29.148129
9f6dcd39-ca7c-4fc9-a1b2-a9ab50e89502	890126	Electrocardiograma	Servicio importado: Electrocardiograma	individual	\N	\N	t	2025-08-05 22:15:31.262104
750d11c7-91ef-467c-968a-0d8ec1369b1a	890124	Ecografia Abdominal	Servicio importado: Ecografia Abdominal	individual	\N	\N	t	2025-08-05 22:15:33.00359
9115fa8c-f240-4002-b6eb-26bac32a31b3	ECOGRAFIA PARTES BLANDAS O  MUSCULOESQUE	CONSALUD	Servicio importado: CONSALUD	individual	\N	\N	t	2025-08-13 14:11:45.35382
a0623a3e-bd27-445f-8f7e-11846a83b069	TAC DE ABDOMEN Y PELVIS	CONSALUD	Servicio importado: CONSALUD	individual	\N	\N	t	2025-08-13 14:11:46.025399
8c06a97c-cb6b-47a0-b073-ada8a44608e3	TORAX -FLUOROSCOPIA 2 PROYEC.	CONSALUD	Servicio importado: CONSALUD	individual	\N	\N	t	2025-08-13 14:11:46.665971
1b85bdb9-d3f7-413e-aaa6-878e718687c8	LUMBAR-LUMBOSACRA CON 5TO ESPACIO (3-4EX	CONSALUD	Servicio importado: CONSALUD	individual	\N	\N	t	2025-08-13 14:11:47.290856
1b7167a4-c3c5-42b2-870f-3fc38f17f535	ECOTOMOGRAFIA VASCULAR PERIFERICA BILATE	CONSALUD	Servicio importado: CONSALUD	individual	\N	\N	t	2025-08-13 14:11:47.919167
3577ec61-776c-452f-b3d2-045d13bee4ee	TAC PIELOGRAFIA	CONSALUD	Servicio importado: CONSALUD	individual	\N	\N	t	2025-08-13 14:11:49.722033
a0d62072-b3b8-4135-9023-3097f9e923a2	BRAZO	CODO	Servicio importado: CODO	individual	\N	\N	t	2025-08-13 14:11:50.717007
3a72c341-c572-488c-9687-cfd457245ef2	PROYECCIONES ESPECIALES OBLICUAS:HOMBRO	Servicio PROYECCIONES ESPECIALES OBLICUAS:HOMBRO	Servicio importado: 	individual	\N	\N	t	2025-08-13 14:11:52.265027
c06c163d-cbdd-4026-8d7a-2a76cfa3ed99	HOMBRO	FEMUR	Servicio importado: FEMUR	individual	\N	\N	t	2025-08-13 14:11:53.992993
7663e889-dea1-412b-9fbf-9d119b424454	RESONANCIA RODILLA	CONSALUD	Servicio importado: CONSALUD	individual	\N	\N	t	2025-08-13 14:11:55.720242
055ce111-7c6b-4339-9c64-ce74a1dd5795	RESONANCIA CRANEOENCEFALICA U OIDOS	BIL	Servicio importado: BIL	individual	\N	\N	t	2025-08-13 14:11:56.674299
e63d761e-c508-4b6f-a8e2-b833d3bc46fe	ELECTROCARDIOGRAMA ( E.C.G.)	CRUZ BLANCA	Servicio importado: CRUZ BLANCA	individual	\N	\N	t	2025-08-13 14:11:57.13054
75581c57-05b7-488c-ab31-6af0a5d76994	ERGOMETRIA (INCLUYE E.C.G. DE REPOSO)	CRUZ BLANCA	Servicio importado: CRUZ BLANCA	individual	\N	\N	t	2025-08-13 14:11:57.758453
74639fd5-86a7-43ba-9a9e-aa04c61e18c5	TAC TORAX TOTAL  (30 CORTES 8-10MM)	CRUZ BLANCA	Servicio importado: CRUZ BLANCA	individual	\N	\N	t	2025-08-13 14:11:58.143749
23e72385-50d8-4cf3-b2e1-627fae1a2c4b	TAC UROGRAFIA	CRUZ BLANCA	Servicio importado: CRUZ BLANCA	individual	\N	\N	t	2025-08-13 14:11:58.778034
281025c8-11a3-4cc3-814f-9ef132814702	ECOTOMOGR PELVICA MASCULINA (INC VEJIGA	CRUZ BLANCA	Servicio importado: CRUZ BLANCA	individual	\N	\N	t	2025-08-13 14:11:59.412862
207d1b8d-f6e2-4686-a9a9-9640dc4d4bcb	CAVIDADES PERINASALES	ORBITAS	Servicio importado: ORBITAS	individual	\N	\N	t	2025-08-13 14:12:00.37424
b1a2b8ac-b2f9-4611-885f-a8464add76fe	ECOTOMOG ABDOMINAL(HIGADO	VIA BILIAR	Servicio importado: VIA BILIAR	individual	\N	\N	t	2025-08-13 14:12:01.125384
2728e1ed-29eb-4a59-93fa-9e4c2d5d0c13	ANGIOTAC DE TORAX	CRUZ BLANCA	Servicio importado: CRUZ BLANCA	individual	\N	\N	t	2025-08-13 14:12:03.194945
b442ca63-5e67-4c7b-a6d5-89b14768eb00	RESONANCIA PELVIS	CRUZ BLANCA	Servicio importado: CRUZ BLANCA	individual	\N	\N	t	2025-08-13 14:12:03.795688
711d4a54-b2b4-41ef-bf94-17d2d501235a	ESOFAGO	ESTOMAGO Y DUODENO D.C. (15 EXP)	Servicio importado: ESTOMAGO Y DUODENO D.C. (15 EXP)	individual	\N	\N	t	2025-08-13 14:12:04.382647
39b0fa4a-0c0a-449e-ac98-c5bf8cd10fb7	CERVICAL FRONTAL Y LATERAL ( 2 EXP)	CRUZ BLANCA	Servicio importado: CRUZ BLANCA	individual	\N	\N	t	2025-08-13 14:12:08.417203
4796cbda-176f-4174-a33b-5af63c735b8d	ESTUDIO MUÑECA O TOBILLO (FRONTAL	LATERA	Servicio importado: LATERA	individual	\N	\N	t	2025-08-13 14:12:08.786448
fdaad782-025f-40d4-b950-a0f2d8301a29	TAC CAVIDADES PARANASALES	VIDA TRES	Servicio importado: VIDA TRES	individual	\N	\N	t	2025-08-13 14:12:11.812208
efc62c57-5d6d-4bce-ab00-979eb66f94da	TAC DE CEREBRO	VIDA TRES	Servicio importado: VIDA TRES	individual	\N	\N	t	2025-08-13 14:12:12.411082
311bc146-16a4-456f-a59c-45cfbc0ebdda	ECOTOMOGRAFIA RENAL  BILATERAL Y DE BAZO	N. MASVIDA-OPTIMA	Servicio importado: N. MASVIDA-OPTIMA	individual	\N	\N	t	2025-08-13 14:12:22.196537
b29e4b45-a917-4c31-a405-994663471643	ESTUDIO CORRIENTE DE BIOPSIA DIFERIDA	N. MASVIDA-OPTIMA	Servicio importado: N. MASVIDA-OPTIMA	individual	\N	\N	t	2025-08-13 14:12:25.121739
67d85af0-9d00-4f3f-8ce6-07b7cf48646b	CITODIAGNOSTICO CORRIENTE (PAPANICOLAU Y	N. MASVIDA-OPTIMA	Servicio importado: N. MASVIDA-OPTIMA	individual	\N	\N	t	2025-08-13 14:12:25.727548
ab9a6938-f36d-4b22-85eb-a0a259a4c75f	RESONANCIA MAGNETICA DE PIE	ANTEPIE O T	Servicio importado: ANTEPIE O T	individual	\N	\N	t	2025-08-13 14:12:38.366767
b8121179-fa77-45a5-b474-50d70d157954	MAMOGRAFIA DIGITAL BILATERAL	N. MASVIDA-OPTIMA	Servicio importado: N. MASVIDA-OPTIMA	individual	\N	\N	t	2025-08-13 14:12:39.328311
72a2a6d8-8578-4362-aa55-4e1f2d3c1a29	ECOTOMOGRAFIA MAMARIA BILATERAL (20 min)	N. MASVIDA-OPTIMA	Servicio importado: N. MASVIDA-OPTIMA	individual	\N	\N	t	2025-08-13 14:12:39.958637
7197d851-5878-4874-826c-ba563789396f	PROYECCION DIGITAL DE MAMAS	N. MASVIDA-OPTIMA	Servicio importado: N. MASVIDA-OPTIMA	individual	\N	\N	t	2025-08-13 14:12:47.38386
f08b3983-aa5e-4b03-82e8-afc44f65ed04	OBTURACIÓN DE CEMENTOS VIDRIOS IONÓMEROS	ISALUD	Servicio importado: ISALUD	individual	\N	\N	t	2025-08-13 14:12:50.050018
b7285e7d-cf22-4aff-abc7-3c1ac3211d22	INTERCONSULTA URGENCIA DENTAL	ISALUD	Servicio importado: ISALUD	individual	\N	\N	t	2025-08-13 14:12:50.665077
2d356957-08a2-4ce9-b75e-75cb73494af5	CLAVICULA (1 EXP)	ISALUD	Servicio importado: ISALUD	individual	\N	\N	t	2025-08-13 14:12:51.717102
606574d3-f2fa-4517-9e93-91770bc59108	HISTOQUIMICA	ISALUD	Servicio importado: ISALUD	individual	\N	\N	t	2025-08-13 14:12:54.658162
96372d62-9d0e-487f-8af3-1c43a6a29d21	PELVIS	PROYEC. ESP.DE CADERAS O COXOFEMO	Servicio importado: PROYEC. ESP.DE CADERAS O COXOFEMO	individual	\N	\N	t	2025-08-13 14:12:55.043878
16a3908f-7b65-4d7d-9025-ae75ec6b24d9	LUMBOSACRA	OBLICUAS ADICIONALES ( 2EXP)	Servicio importado: OBLICUAS ADICIONALES ( 2EXP)	individual	\N	\N	t	2025-08-13 14:12:57.360998
bd115558-daa2-4224-ba61-6d90abb2b387	RESONANCIA ANGIOGRAFIA DE ENCEFALO	ISALUD	Servicio importado: ISALUD	individual	\N	\N	t	2025-08-13 14:12:58.865427
5c892299-19fb-45b5-896a-5b4f01a6edbf	ECOTOMOGRAFIA TIROIDEA	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:13:08.441407
19e073e8-249d-4d05-a92f-bd6e452d70e4	ABDOMEN (HIGADO	VIAS Y VESICULA BILIAR	Servicio importado: VIAS Y VESICULA BILIAR	individual	\N	\N	t	2025-08-13 14:13:10.746696
ba714af7-40f0-4b13-ac9e-d73d4e6daf9f	ESTUDIO DE ESCAFOIDES	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:13:28.131698
82d18d73-99ff-445e-ae5c-c98010ed3116	CINTIGRAFÍA GLÁNDULAS PARATIROIDES (NO I	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:13:29.067086
0eeab6f8-0f5a-41d4-956c-1785d85e0359	CINTIGRAFIA OSEA COMPLETA PLANAR	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:13:29.677586
54245f82-8478-47c0-9793-3a22931405ff	CINTIGRAFÍA RENAL CON D.M.S.A.	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:13:30.282673
0edff945-d11a-49a6-aafa-098b65cc261c	SPECT CUALQUIER ORGANO ( OSEO	PULMONAR	Servicio importado: PULMONAR	individual	\N	\N	t	2025-08-13 14:13:31.239223
e753bf15-8b35-4c7e-b42d-b41ed7aaf82e	SPECT CARDÍACO STRESS Y REPOSO (NO INCLU	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:13:31.931095
20efdfd2-7556-4d6a-b269-9a782afe4f5f	ESTUDIO DINÁMICO RENAL CON TC 99-MAG 3	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:13:35.377614
2e549267-8399-429f-a50b-018545690d13	TEST DE HOLTER (20 A 24 HRS. DE REGISTRO	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:13:37.521428
d1379667-7540-4232-88eb-04a43a173252	CITOLOGIA NO GINECOLOGICA	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:13:48.426933
3adb5d28-dc2f-4050-8dec-d04b72ec8a9f	ECOTOMOGRAFÍA TRANSVAGINAL O TRANSRECTAL	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:13:51.19375
d5ca3242-6cdc-49a7-b005-0abece3bbc5c	DOPPLER DE VASOS PLAC.SCREENING DE 11-14	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:13:51.84007
376ced6a-bc93-4810-afd4-342cfb7e75fb	ECO OBST C/ EST. FETAL  O ECO GINE ABDOM	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:13:52.445568
e89586ee-0960-4b20-9fbd-472e11f29508	CRANEO	CADA PROYECCION ESP.:AXIAL	Servicio importado: CADA PROYECCION ESP.:AXIAL	individual	\N	\N	t	2025-08-13 14:14:00.244554
c33c96f0-624c-4c87-8024-fc9e110ba158	EDAD OSEA:CARPO Y MANO (1 EXP)	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:14:02.407571
3d7a35e6-189b-42b0-8e4e-9867ca585e0f	PARTES BLANDAS  LARINGE LATERAL CAVUM RI	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:14:03.628579
2d707f73-bded-41d2-b4cb-7f9309adb6e1	RESONANCIA MAGNETICA DE HOMBRO	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:14:09.918263
594af871-5115-4549-a609-d1f419e659b7	DENSITOMETRIA OSEA A  FOTON DOBLE	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:14:12.068802
901b6da4-41b8-411a-89ff-151a40e50b52	RADIOGRAFIA UNA PROYECCION (INCL. FLUOR.	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:14:18.216558
1c2b8764-5733-4147-b87d-c70a1708a8dc	PRIMERA CONSULTA	EXÁMEN Y DIAGNÓSTICO P	Servicio importado: EXÁMEN Y DIAGNÓSTICO P	individual	\N	\N	t	2025-08-13 14:14:24.229476
17999d65-1390-4869-a7a7-d1cdf5832fb2	HIGIENE Y PROFILAXIS EN NIÑOS Y ADULTO	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:14:24.634268
9a07b23b-f963-4344-b548-c04512f7c140	PULIDO RADICULAR INCIPIENTES A MODERADAS	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:14:25.860671
f84fa16d-3e0e-49ec-9c9c-582595c1c3f2	DESTARTRAJE SUPRAGINGIVAL	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:14:26.476463
b8080783-4818-42a9-a8e4-9ed7309c0e65	URETROGRAFIA RETROGRADA O CISTOURETROGRA	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:14:27.123463
2dccfd20-bd83-4b18-bcc3-502cb4e472b3	ARTROGRAFIA BAJO VISION (HON MED.)	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:14:27.507003
614ba5bb-d342-4dc9-a22b-60f5563b9901	ANESTESIA GENERAL O REGIONAL OTORGADA PO	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:14:27.881131
d1f9776f-5258-44fa-a5d6-2855f605181c	CABEZA	CUELLO Y GENIT 4 ( HON MED.)	Servicio importado: CUELLO Y GENIT 4 ( HON MED.)	individual	\N	\N	t	2025-08-13 14:14:28.269068
f654acfb-c62f-4244-98c3-4cf4b86ac93a	FULGURACION ENDOS. C/ARGON PLASMA (HON M	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:14:28.662216
b8c28446-95a2-490e-a285-dd1cfbb894e0	COLONOSCOPIA  CORTA  (HON MED.)	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:14:29.275747
d6638793-bf07-4aba-b4cf-2d5d0350a42f	PANENDOSCOPIA ORAL (HON MED.)	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:14:29.860632
e771fcb2-664d-4357-8235-83aa9d3b1432	BOTA LARGA DE YESO ( HM )	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:14:31.96232
f49af123-4376-461e-a7ea-109b23be68f5	YESO ANTEBRAQUIAL C/S FERULA DIG (HM )	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:14:32.346418
2ab11629-83e1-4a8c-ba25-2987c0282d98	ESTUDIO URODINAMICO (INC CISTO) (HON MED	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:14:32.759898
ab855021-bbf9-42e2-b588-20cd82a038b1	CISTOSCOPIA Y/O URETROCISTOSCO (HON MED)	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:14:33.324307
b8e07fd6-3995-47a2-8fd6-e3047b2a470c	DILATACION ESOFAGICA POR BALON ( HON MED	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:14:33.698981
e0fa02c6-7faf-4090-b535-258d1e6e8431	COLONOSCOPIA  LARGA  (HON MED.)	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:14:34.303362
9f5a8c3f-c29d-46af-8205-01b53ceabe81	TAC DE DE COLUMNA LUMBAR	PARTICULAR	Servicio importado: PARTICULAR	individual	\N	\N	t	2025-08-13 14:14:45.56491
8d542bc7-f9d8-44f8-8eb1-592817f97c57	ESTUDIO HISTOP.CON TECNICAS DE INMUNOHIS	PARTICULAR	Servicio importado: PARTICULAR	individual	\N	\N	t	2025-08-13 14:14:46.84763
5b1eee0b-282c-4f2f-946f-c5cbb57af848	MONITORIZACION CICLO E INSEMINACION INTR	PARTICULAR	Servicio importado: PARTICULAR	individual	\N	\N	t	2025-08-13 14:14:59.038381
e27cc897-bf19-43bd-b387-3424fde85f5f	COLOCACION O EXTRACCION DE DIU (PROC)	PARTICULAR	Servicio importado: PARTICULAR	individual	\N	\N	t	2025-08-13 14:15:00.664318
a795539e-2711-43d6-824c-c59f7a9937fc	NASOFARINGOLARINGOFIBROSCOPIA (HM)	PARTICULAR	Servicio importado: PARTICULAR	individual	\N	\N	t	2025-08-13 14:15:01.031094
1c951b3a-4d43-4dd4-9241-a9b3acfb5967	POLIPOS RECTALES	RECTOSIGMOIDEOS (HON M	Servicio importado: RECTOSIGMOIDEOS (HON M	individual	\N	\N	t	2025-08-13 14:15:02.670911
60ceba47-1043-4418-8c59-30745f1ffa4c	INFILTRACION LOCAL DE MEDICAMENTOS BURSA	PARTICULAR	Servicio importado: PARTICULAR	individual	\N	\N	t	2025-08-13 14:15:06.216309
34a5b042-8ca3-4a57-bf5f-8317c36df7d6	CRIOTERAPIA HASTA 5 LESIONES	PARTICULAR	Servicio importado: PARTICULAR	individual	\N	\N	t	2025-08-13 14:15:06.593198
6498038e-fa86-41cb-bbb3-d345f13d7905	ABDOMEN SIMPLE	PROYECCION COMPLEMENTAR	Servicio importado: PROYECCION COMPLEMENTAR	individual	\N	\N	t	2025-08-13 14:15:34.714033
2698daf8-7fe3-4382-a243-61cd34599629	RESONANCIA MAGNETICA DE MANO O MUÑECA	BANMEDICA	Servicio importado: BANMEDICA	individual	\N	\N	t	2025-08-13 14:15:38.56006
f1a80f11-478f-4d6b-a48f-d4e4323e0d11	DOPPLER DE VASOS PLAC. SCRENING DE 21-24	BANMEDICA	Servicio importado: BANMEDICA	individual	\N	\N	t	2025-08-13 14:15:42.261389
71241bff-f8b3-4457-8fe0-5a90d930fcf4	ECOTOMOGRAFIA DOPPLER GINECOLOGICO	COLMENA	Servicio importado: COLMENA	individual	\N	\N	t	2025-08-13 14:15:46.507543
b5e0d953-c69d-4a44-9f61-5fd09fe93f8a	HISTEROSONOGRAFÍA	COLMENA	Servicio importado: COLMENA	individual	\N	\N	t	2025-08-13 14:15:48.894104
601f5154-47be-4ea4-809c-4db814799206	RESONANCIA ABDOMEN + PELVIS	COLMENA	Servicio importado: COLMENA	individual	\N	\N	t	2025-08-13 14:15:53.511239
e167f47a-cca8-4466-accb-938f5b49f29b	ECOTOMOGRAFIA PELVIANA FEMENINA.-	COLMENA	Servicio importado: COLMENA	individual	\N	\N	t	2025-08-13 14:16:10.093212
8d3e7400-7fb7-4bde-9a18-11e1a45b6c3f	ECOTOMOGRAFIA DOPPLER FETO MATERNO	COLMENA	Servicio importado: COLMENA	individual	\N	\N	t	2025-08-13 14:16:17.851803
2a2962f5-974c-453b-a969-974853ae178d	RESONANCIA COLUMNA LUMBAR	COLMENA	Servicio importado: COLMENA	individual	\N	\N	t	2025-08-13 14:16:18.452767
995b9fed-0c7b-4be2-9c0e-669067e6b889	RESONANCIA MAGNETICA MUSLO O CADERA UNI	COLMENA	Servicio importado: COLMENA	individual	\N	\N	t	2025-08-13 14:16:19.603187
db046095-5a14-4a24-b4b6-16ff04a158ca	CRANEO FRONTAL Y LATERAL (2EXP)	CONSALUD	Servicio importado: CONSALUD	individual	\N	\N	t	2025-08-13 14:16:22.582313
8a80b0f7-a301-4e31-a066-e3f6e017f163	CERVICAL FRONTAL	LATERAL Y OBLICUAS (4	Servicio importado: LATERAL Y OBLICUAS (4	individual	\N	\N	t	2025-08-13 14:16:28.401942
64879315-085e-4b95-a506-e199e9d56cf7	ECOTOMOGRAFIA CAROTIDEA BILATERAL	CONSALUD	Servicio importado: CONSALUD	individual	\N	\N	t	2025-08-13 14:16:39.717577
43e83f4b-2f9b-45d9-a082-d99a0e88a174	RESONANCIA COLUMNA CERVICAL	CONSALUD	Servicio importado: CONSALUD	individual	\N	\N	t	2025-08-13 14:16:45.294173
94f47e3b-9b72-4dd9-a339-ddea7f7b226a	ECOCARDIOGRAMA DOPPLER COLOR	CRUZ BLANCA	Servicio importado: CRUZ BLANCA	individual	\N	\N	t	2025-08-13 14:16:58.622458
fbf5fe54-bc41-458f-b5be-44f4f9855571	PART MONITOREO PRESION JULIO 2025	Servicio PART MONITOREO PRESION JULIO 2025	Servicio importado: 	individual	\N	\N	t	2025-08-13 14:17:56.0223
1ea470b7-da34-485d-b9cd-b1873242bd8f	ANGIOTAC DE ABDOMEN	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:18:10.458191
db74693e-1a53-4155-919a-8daabc0c4fbf	PELVIS INCL SACRO	COXIS	Servicio importado: COXIS	individual	\N	\N	t	2025-08-13 14:18:10.822593
95768827-ce39-4c17-9e9b-a656bd37b38e	INTERCONSULTA HORARIO HABIL	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:18:19.414073
2380a9b8-eb6d-4778-9a55-1cb453eb29c4	CAUTERIZACION NASAL	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:18:20.039577
d6f25cd0-36db-432d-b1e0-47ed78536adb	INTERCONSULTA HORARIO INHABIL PEDIATRICA	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:18:20.420309
7ed4d425-472d-4de6-8977-fe66adc59739	SIMPLES: 1 O VARIAS HASTA 5 (HON MED.)	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:18:21.586254
a02f4598-e1b2-473b-ba36-1c01e979f490	HERIDAS COMPLIC. DE LA CARA (HON MED.)	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:18:22.214559
37789be0-ad53-46cb-a215-8f58299bdab4	REDUCCIÓN E INMOV DE LUXACIÓN DEN SIMPLE	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:18:22.625006
67c6b5bb-4d4d-488f-9cd3-6d4935abc1d2	TRATAMIENTO DE HERIDAS DE LA MUCOSA BUCA	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:18:23.335507
4a273212-0f41-40e7-b554-74e5590dccc0	EXODONCIA SIMPLE	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:18:24.291734
70c6dd9e-e1ea-47c6-8e0f-42ccfea62ba4	ECOTOMOGRAFIA TESTICULAR	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:18:31.177389
a6f756e3-eee0-4719-8070-d1e90c8d74a1	COLANGIORESONANCIA	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:18:48.166509
f3ad0c05-9b6c-467a-9872-19f639e7a739	ESPIROMETRIA BASAL Y CON BRONCODILATADOR	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:19:02.005356
92a5d5b6-0fa9-47b5-bac7-5663e1e292d8	PROYECCION AXILAR COMPLEMENTARIA	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:19:02.380784
2ac07b83-9d80-4b36-b77b-ac4fc24bd012	MAMOGRAFIA (4 EXP.)	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:19:04.099166
5dd9ded7-ba3f-4094-8867-67d36c53e6f4	RESONANCIA COLUMNA TOTAL (CERV	DOR	Servicio importado: DOR	individual	\N	\N	t	2025-08-13 14:19:11.911323
ab8ef0fa-90c0-4af2-9203-8b3ecb8429a0	POLIPOS DE ESOFAGO Y/O ESTOMAG (HON MED.	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:19:27.536928
f3d54f5b-901e-4bc4-b8db-189f1b18bba1	BIOPSIA DE ENDOM	VULVA	Servicio importado: VULVA	individual	\N	\N	t	2025-08-13 14:19:31.381179
c9880edc-205b-44da-b6e5-92147aa2f53a	COLPOSCOPIA	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:19:32.350229
e1c25ec2-a54e-4d98-baaf-133fbca2d2ba	HON ASISTENCIA CARDIOLOGICA POR RESONANC	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:19:33.287184
e830250b-31e7-4d80-ad6e-5b5343cfb6eb	TAC DE COLUMNA DORSAL	INCL MIN. 6 ESPA	Servicio importado: INCL MIN. 6 ESPA	individual	\N	\N	t	2025-08-13 14:19:35.81569
77ac5c17-d226-4a37-8c28-ad8fe6fe23c1	ELASTOGRAFIA HEPATICA	PARTICULAR	Servicio importado: PARTICULAR	individual	\N	\N	t	2025-08-13 14:19:53.012953
90f8f18d-2904-4283-8b60-16971702d3ca	TAC DE COLONOSCOPIA VIRTUAL INC INST.SON	PARTICULAR	Servicio importado: PARTICULAR	individual	\N	\N	t	2025-08-13 14:19:55.963641
c0a26ea2-1266-457e-8afe-f50b4b27f136	MONITOREO BASAL	PARTICULAR	Servicio importado: PARTICULAR	individual	\N	\N	t	2025-08-13 14:20:01.161097
41b75b09-d9db-4649-af57-45323e892ea5	ATENCION MATRONA	PARTICULAR	Servicio importado: PARTICULAR	individual	\N	\N	t	2025-08-13 14:20:01.773352
d7e2fde3-d996-4010-bd6a-d5d2b4a0a420	VELOCIDAD DE CONDUCCION	PARTICULAR	Servicio importado: PARTICULAR	individual	\N	\N	t	2025-08-13 14:20:06.748838
e39a1671-f3c2-41aa-9484-17f581222527	ELECTROMIOGRAFIA CUALQUIER REGION	PARTICULAR	Servicio importado: PARTICULAR	individual	\N	\N	t	2025-08-13 14:20:07.365397
a7a17da7-2a68-4da0-bf21-6bf2eb861d4a	PHMETRIA	PARTICULAR	Servicio importado: PARTICULAR	individual	\N	\N	t	2025-08-13 14:20:08.317907
76fb5e92-db32-4216-95c2-c51cdf25d55c	MANOMETRIA ESOFAGICA ALTA RESOLUCIÓN	PARTICULAR	Servicio importado: PARTICULAR	individual	\N	\N	t	2025-08-13 14:20:09.50242
12b81b63-1284-4bdf-9bf6-a5e180842434	RESONANCIA ABDOMEN	BANMEDICA	Servicio importado: BANMEDICA	individual	\N	\N	t	2025-08-13 14:20:21.970354
5774403a-9a4a-4c83-8680-2ba4933f01ce	CERVICAL FUNCIONALES ADICIONALES (2 EXP)	COLMENA	Servicio importado: COLMENA	individual	\N	\N	t	2025-08-13 14:20:55.20135
afff0148-21b8-4e11-bfe9-ff2addc8cd50	EXTREMIDADES	ESTUDIO LOCALIZADO (30 CO	Servicio importado: ESTUDIO LOCALIZADO (30 CO	individual	\N	\N	t	2025-08-13 14:21:14.706062
1a66fb50-46d7-4fe3-b5ca-42e57b9138fb	CUELLO	PARTES BLANDAS C/S  MEDIO DE CONT	Servicio importado: PARTES BLANDAS C/S  MEDIO DE CONT	individual	\N	\N	t	2025-08-13 14:21:28.491446
b60d7aec-4ee9-4b2d-bd5c-4d9cf73ffb08	SACRO-COXIS O ARTICULACIONES SACROI.	C/U	Servicio importado: C/U	individual	\N	\N	t	2025-08-13 14:21:38.040182
6ec27653-0653-4330-a3f6-b757c5c3971e	COLUMNA TOTAL PANORAMICA CON FOLIO GRAD.	CONSALUD	Servicio importado: CONSALUD	individual	\N	\N	t	2025-08-13 14:21:59.095246
e8ed8295-877e-4b49-be05-019bc44dca91	TAC DE CALCIO CORONARIO	CRUZ BLANCA	Servicio importado: CRUZ BLANCA	individual	\N	\N	t	2025-08-13 14:22:15.211373
0959ade4-5a59-4605-a15b-672348d23620	ANGIOTAC DE TORAX CORONARIO	CRUZ BLANCA	Servicio importado: CRUZ BLANCA	individual	\N	\N	t	2025-08-13 14:22:15.81158
04628599-2439-4a19-bc5e-50fa28d41b82	ANGIOTAC  CORONARIO	CRUZ BLANCA	Servicio importado: CRUZ BLANCA	individual	\N	\N	t	2025-08-13 14:22:16.445695
27311766-bb05-4a92-9a9c-3541bea3d258	ANGIOTAC DE CEREBRO	CRUZ BLANCA	Servicio importado: CRUZ BLANCA	individual	\N	\N	t	2025-08-13 14:22:20.273569
88c062fb-4283-47fa-8986-159591d732f0	INTERCONSULTA HORARIO INHABIL	VIDA TRES	Servicio importado: VIDA TRES	individual	\N	\N	t	2025-08-13 14:22:34.880017
16e962b9-ff55-45fa-92c7-0da247f0d86d	COLUMNA CERVICAL:(CORTES 2MM.40 CORTES)	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:23:26.257151
5a9ef36a-e126-4e20-b5fb-5cd6587295c1	ANGIO TAC DE EXTREMIDADES INFERIORES BIL	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:23:27.469087
c7b65955-c283-49aa-a112-ed207b18c924	MANEJO DEL DOLOR OROFACIAL	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:23:29.799752
4ffc0c34-e95f-46cd-aba4-4976bec6df88	RECONSTITUCIÓN PARCIAL DEE CORONA O CARI	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:23:31.918363
659170bc-7920-4ce7-8e32-b6a0b95567f6	INTERCONSULTA HORARIO HABIL PEDIATRICA	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:23:32.830486
39f04d16-95af-4a2f-8e18-e9f8f7698a7a	RADIOGRAFIA TORAX (EQUIPO MOVIL) UNA O M	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:23:33.774335
4802bfa9-c2a7-4bdf-9359-9c82ee189766	ESTUDIO HISTOP.DE BIOPSIA CORRIENTE	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:23:43.625564
7a44cbbb-a808-480c-ab5c-5469173b842f	ECOTOMOGRAFIA CEREBRAL (R.N.- LACTANTE)	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:23:52.241174
56f827c8-a217-4ec9-9794-9d743415a85f	ECOTOMOGRAFIA DOPPLER GINE EST. ENDOMETR	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:24:01.489836
00ee18e7-33f5-488f-bbe9-97ecc3291f4e	RESONANCIA CUELLO	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:24:02.68099
26e447aa-f988-463e-863c-87efab12ea11	COLUMNA DORSOLUMBAR	FONASA	Servicio importado: FONASA	individual	\N	\N	t	2025-08-13 14:24:44.412658
efb31ffa-2320-43b5-a92d-18e2944d7fd2	TREPANACIÓN DENTARIA DE URGENCIA	PARTICULAR	Servicio importado: PARTICULAR	individual	\N	\N	t	2025-08-13 14:25:07.621532
93e09e15-2873-4c82-8452-64e8efa234b5	PH CON IMPEDANCIOMETRIA	PARTICULAR	Servicio importado: PARTICULAR	individual	\N	\N	t	2025-08-13 14:25:34.576955
31126085-391b-4686-8458-4e0b53eae62a	CONSULTA MEDICINA PREVENTIVA EMPRESAS	PARTICULAR	Servicio importado: PARTICULAR	individual	\N	\N	t	2025-08-13 14:25:35.521389
e2739fb0-1c6b-4d33-b36e-f0d9e44f120f	EEG 3 HORAS	PARTICULAR	Servicio importado: PARTICULAR	individual	\N	\N	t	2025-08-13 14:25:36.926505
743c4aea-3cca-44ab-a56c-aff6fcb8a1e7	01-AUG-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 15:32:38.209842
a4d396d7-95eb-473e-a6f6-d7183fa0a124	04-AUG-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 15:32:38.626021
6a07fb2e-b6a9-4b28-bd3f-ad1f42b89d57	02-AUG-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 15:32:39.000346
ae226431-e301-45b0-8e22-fd8bb38c8da0	31-JUL-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 15:32:39.362811
a8414853-4340-4f72-848a-90e303d1dac7	30-JUL-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 15:32:46.281497
f8246a7a-c349-40a7-8aa8-f99b1fb2a0b1	26-MAY-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 15:32:47.556989
d99f9106-69a4-4cac-98e4-450676ddc7f9	24-APR-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 15:32:47.939904
20d01319-38f8-4226-b9c7-ebcf1ff4d217	26-APR-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 15:32:48.276153
9fc8ec7b-89b5-4f63-92f5-206d94aced82	06-MAR-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 15:32:48.636468
e515d603-a763-46e0-9446-b2b2f30c9f45	23-JUL-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 15:32:49.618664
dae8bcae-b1ea-4c19-a11e-94324dc751fa	06-JUL-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 15:32:53.050058
65de2595-aa13-4638-83de-e76800c768c6	09-MAY-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 15:32:54.623591
ec67c152-e785-4213-a198-427d5ff5e0c0	31-MAR-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 15:32:55.316945
a965dbed-a8c7-4fea-b0fb-7678b32d3beb	21-APR-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 15:32:55.677502
39a2abfa-6f39-484a-9a4d-5ea2b682e941	13-MAR-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 15:33:06.165101
98e335fa-5a0c-4d99-abe8-1b4c7e2aae5d	09-JUL-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 15:33:07.131082
72f63eb2-cc5a-4257-97a9-03e731b5bc1c	07-APR-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 15:33:07.47807
1cc2845a-b072-4ac0-94d0-9304c8f53922	22-NOV-23	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 15:33:08.756652
444aa398-dcc5-4093-bdc8-fb7341cd325e	05-AUG-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 16:50:04.698243
82a15d5c-2e83-43d5-b610-f6ec277eaaba	01-Aug-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 19:39:38.38844
840df426-536d-4154-8b05-5ff311043b1e	04-Aug-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 19:39:38.571403
8f1b1b40-4a3a-460e-90c5-08ffdfc912af	02-Aug-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 19:39:38.730069
c1680f0c-9bcb-4962-a68e-9508a5200ba8	31-Jul-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 19:39:38.885561
c97ce25d-b0e3-4b7e-a375-b308a55ab254	30-Jul-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 19:39:41.00738
5eb75de4-2195-4f81-b790-9e122bbf5623	24-Apr-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 19:39:41.513639
41cd89d8-a5f2-4fd4-bb19-0fdda79fdae1	26-Apr-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 19:39:41.67288
9438f23b-be4b-4ca0-a516-a0a29d966c54	06-Mar-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 19:39:41.829973
4e439e4e-d3fc-4146-8a00-c1240b44383e	23-Jul-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 19:39:42.103607
2ad3017d-a086-411f-859b-d45dcbbcce88	09-May-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 19:39:43.664784
cd7df346-d237-468f-bc77-6e8c9305586f	09-Jul-25	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 19:39:46.168991
8468d88c-14a7-40e5-94a1-5490adfe1532	22-Nov-23	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-13 19:39:46.321003
e6dc3691-8214-4b8a-850a-ae14fcc8ab88	45870	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-17 00:04:55.765836
81db564e-0dff-4a8c-be19-d7ea2ff75d47	45873	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-17 00:04:56.138213
c9c547f7-dfc5-4413-acc2-1b3dc0d40628	45871	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-17 00:04:56.465537
6decea22-74c0-42ed-ac9d-e96be873f550	45869	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-17 00:04:56.803953
6a17264b-c769-49c5-ae2d-fdd76a24e4af	45868	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-17 00:05:03.270911
0554de83-3098-4702-b72a-98f4a3ba0a70	45803	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-17 00:05:04.513148
dc453612-cc8f-4aa8-a0ea-7c85d61cc4fa	45771	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-17 00:05:04.851473
f7953986-48e4-4fe1-ac89-21050b428163	45773	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-17 00:05:05.196076
f413b31a-9dc6-4019-8539-0cff6d94353b	45722	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-17 00:05:05.542639
309a1ae2-6c9b-48f3-99e2-9fd5c54d4dca	45861	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-17 00:05:06.468375
fd85ee3d-a832-4bc1-b25f-d3ae4975c565	45844	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-17 00:05:09.506182
192d3db7-8551-420d-959e-d8a3edb46172	45786	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-17 00:05:11.126583
9de55791-d628-45b7-8c0c-64212da22bc1	45747	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-17 00:05:11.773174
35c23e07-1282-477e-860a-24adaa2dc5b7	45768	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-17 00:05:12.11181
8c366c67-cb9f-4588-a7f4-418cfad7b7b8	45729	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-17 00:05:22.323372
3a160a06-a1d1-49bd-8268-56272a371d7f	45847	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-17 00:05:23.260959
67b7f73d-bdfb-49fe-80a1-3554e1be250b	45754	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-17 00:05:23.591633
64d26815-e4d5-44f6-8143-6eadabcb6dfc	45252	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-17 00:05:24.850449
97f72323-b55a-440c-96a6-7cd12034902f	45866	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-17 00:39:39.119876
3c02bec0-28d5-4b0f-aa5f-215e1b4dffe3	45874	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-17 00:39:39.786978
10caca2d-1b57-400c-916c-861e1dae322a	45856	76375293-3	Servicio importado: 76375293-3	individual	\N	\N	t	2025-08-17 00:39:43.314254
e6789bcc-b782-4934-8929-9240e74ba5a3	001	Consulta Médica	Servicio importado: Consulta Médica	individual	\N	\N	t	2025-08-17 01:50:37.99498
70a381c2-b5ce-4917-a068-f74d797aff8f	04-04-016-01	ECOTOMOGRAFIA GENERAL	Servicio importado: ECOTOMOGRAFIA GENERAL	individual	\N	\N	t	2025-08-17 01:57:45.64437
40163101-f9b0-48cd-bc42-95295ae04654	04-03-020-01	MAIPU SCANNER	Servicio importado: MAIPU SCANNER	individual	\N	\N	t	2025-08-17 01:57:45.816786
1f4d198a-92ee-4d4f-82c0-098a59501e8f	04-01-070-01	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 01:57:45.978131
36bcf69b-7ecf-40eb-889e-aacbcdbc6a07	04-01-046-01	MAIPU RADIOLOGIA	Servicio importado: MAIPU RADIOLOGIA	individual	\N	\N	t	2025-08-17 01:57:46.135781
a5f11a4a-43c9-4894-8c50-e75fa7f0b863	04-04-118-01	MAIPU ECOTOMOGRAFIA GENERAL	Servicio importado: MAIPU ECOTOMOGRAFIA GENERAL	individual	\N	\N	t	2025-08-17 01:57:46.291891
f0fb96de-15ba-48e2-93b2-c4cc994ef3f5	04-03-021-01	MAIPU SCANNER	Servicio importado: MAIPU SCANNER	individual	\N	\N	t	2025-08-17 01:57:46.688925
c7336006-9919-430f-bc1b-e88269880dc4	04-01-054-01	MAIPU RADIOLOGIA	Servicio importado: MAIPU RADIOLOGIA	individual	\N	\N	t	2025-08-17 01:57:46.967467
f1c1ce8e-08b9-4343-b56b-3f67684d9644	04-01-062-01	MAIPU RADIOLOGIA	Servicio importado: MAIPU RADIOLOGIA	individual	\N	\N	t	2025-08-17 01:57:47.3706
c6045532-1d14-4e6d-bebc-00425eb00b65	04-01-060-01	MAIPU RADIOLOGIA	Servicio importado: MAIPU RADIOLOGIA	individual	\N	\N	t	2025-08-17 01:57:47.776908
c707dc61-25f2-4256-b869-e66f1f5b52a2	04-05-013-01	RESONANCIA NUCLEAR MAGNETICA	Servicio importado: RESONANCIA NUCLEAR MAGNETICA	individual	\N	\N	t	2025-08-17 01:57:48.241695
e2ad6b94-6285-4b4f-8cbb-89178fbb3f55	04-05-027-01	RESONANCIA NUCLEAR MAGNETICA	Servicio importado: RESONANCIA NUCLEAR MAGNETICA	individual	\N	\N	t	2025-08-17 01:57:48.985451
dfed0a70-fbca-4a3f-b36e-69b094bb4270	04-01-059-01	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 01:57:49.491868
29d8f42c-2ae7-4820-976b-81be8313920c	04-03-001-01	SCANNER	Servicio importado: SCANNER	individual	\N	\N	t	2025-08-17 01:57:49.647337
e0efc259-f83e-4a02-9b1b-8b1cf411bdab	04-01-031-01	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 01:57:50.172254
7e6fd189-c827-4fc5-9a4b-eb7d16652c23	04-01-047-01	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 01:57:50.560754
d5a42afb-2b73-40cd-893d-604b5b20b671	04-05-030-01	RESONANCIA NUCLEAR MAGNETICA	Servicio importado: RESONANCIA NUCLEAR MAGNETICA	individual	\N	\N	t	2025-08-17 01:57:50.830587
5416ef23-bf5e-4dc0-bf3c-9d0cfbf26019	04-01-051-01	MAIPU RADIOLOGIA	Servicio importado: MAIPU RADIOLOGIA	individual	\N	\N	t	2025-08-17 01:57:51.858215
6d25acf4-bc59-4fc6-a47a-4b452b28a3b4	04-03-017-01	MAIPU SCANNER	Servicio importado: MAIPU SCANNER	individual	\N	\N	t	2025-08-17 01:57:52.507198
f9e19e7e-36e1-492b-8eb2-1dc0fc79cafe	04-04-015-01	ECOTOMOGRAFIA GENERAL	Servicio importado: ECOTOMOGRAFIA GENERAL	individual	\N	\N	t	2025-08-17 01:57:53.530069
f9e0ab36-8c09-4aa6-9919-0969262030fc	04-04-009-01	ECOTOMOGRAFIA GENERAL	Servicio importado: ECOTOMOGRAFIA GENERAL	individual	\N	\N	t	2025-08-17 01:57:53.692255
9602ca4f-02a0-4df8-a876-bd772c8a1a7d	04-04-003-01	ECOTOMOGRAFIA GENERAL	Servicio importado: ECOTOMOGRAFIA GENERAL	individual	\N	\N	t	2025-08-17 01:57:53.862083
3329ec0b-3b7a-43c4-808b-9ca229b466ce	04-03-016-01	SCANNER	Servicio importado: SCANNER	individual	\N	\N	t	2025-08-17 01:57:55.077353
a065a8eb-113d-42e1-96fd-90cc87d31270	04-03-013-01	SCANNER	Servicio importado: SCANNER	individual	\N	\N	t	2025-08-17 01:57:55.240499
04879fc2-e9ec-48f9-8cd6-d820478fe6ff	04-01-009-01	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 01:57:55.512484
48295a46-a0ca-4c51-989f-54d84fef9f47	04-05-028-01	MAIPU RESONANCIA NUCLEAR MAGNETICA	Servicio importado: MAIPU RESONANCIA NUCLEAR MAGNETICA	individual	\N	\N	t	2025-08-17 01:57:56.136433
507e3cb3-d42c-4f7a-a63b-60463a625e4d	04-01-048-01	MAIPU RADIOLOGIA	Servicio importado: MAIPU RADIOLOGIA	individual	\N	\N	t	2025-08-17 01:58:00.329843
8cef1f0d-6003-4d89-b7cf-710197790059	04-01-049-01	MAIPU RADIOLOGIA	Servicio importado: MAIPU RADIOLOGIA	individual	\N	\N	t	2025-08-17 01:58:02.389704
20af6ec3-f5b6-4b61-ae9d-ba256616cffc	04-01-056-01	MAIPU RADIOLOGIA	Servicio importado: MAIPU RADIOLOGIA	individual	\N	\N	t	2025-08-17 01:58:03.350385
e3116436-03b3-4362-933e-c6e79b6b5446	04-01-058-01	MAIPU RADIOLOGIA	Servicio importado: MAIPU RADIOLOGIA	individual	\N	\N	t	2025-08-17 01:58:03.737549
ede435fa-b8ad-4b2c-aa05-d9a8a1f8a42d	04-05-001-01	RESONANCIA NUCLEAR MAGNETICA	Servicio importado: RESONANCIA NUCLEAR MAGNETICA	individual	\N	\N	t	2025-08-17 03:17:04.642502
435eabea-9c54-4a3f-b48e-feb0a540fbea	17-01-001-01	CARDIO PROCEDIMIENTOS	Servicio importado: CARDIO PROCEDIMIENTOS	individual	\N	\N	t	2025-08-17 03:17:04.875607
ffd07f94-a88a-4ec7-9f71-75a9e3406675	17-01-003-01	CARDIO PROCEDIMIENTOS	Servicio importado: CARDIO PROCEDIMIENTOS	individual	\N	\N	t	2025-08-17 03:17:05.029579
1e38e4b4-f428-493e-9be6-41ba1bdf0ce0	04-03-022-01	SCANNER	Servicio importado: SCANNER	individual	\N	\N	t	2025-08-17 03:17:05.377527
29e5835f-358c-4065-bbcb-f7cebc9bf53c	04-03-102-01	SCANNER	Servicio importado: SCANNER	individual	\N	\N	t	2025-08-17 03:17:06.36064
c1941802-1e1b-49a0-810d-209094dd4ae7	04-05-011-01	RESONANCIA NUCLEAR MAGNETICA	Servicio importado: RESONANCIA NUCLEAR MAGNETICA	individual	\N	\N	t	2025-08-17 03:17:06.517651
3d7dd2ab-f421-4fa8-9b9d-8cda4a6aa9aa	04-01-021-01	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:17:06.670716
cd378aa2-5e4a-4b79-aa2c-61b29ec82a1e	04-01-042-01	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:17:07.54113
9577dc09-93c3-4bce-9aba-fdbd2d179e90	04-03-007-01	SCANNER	Servicio importado: SCANNER	individual	\N	\N	t	2025-08-17 03:17:08.883019
ab44619a-6571-48a4-8d72-47b34f21c9fc	04-04-010-01	ECOTOMOGRAFIA GENERAL	Servicio importado: ECOTOMOGRAFIA GENERAL	individual	\N	\N	t	2025-08-17 03:17:11.495408
52e6c6e7-ddc5-4412-a67a-0ead6fca51ca	08-01-008-01	HISTOPATOLOGIA	Servicio importado: HISTOPATOLOGIA	individual	\N	\N	t	2025-08-17 03:17:12.763016
f496dd3d-8569-487b-be54-8ac48fec2c73	08-01-001-01	HISTOPATOLOGIA	Servicio importado: HISTOPATOLOGIA	individual	\N	\N	t	2025-08-17 03:17:12.916853
1ecf2029-d956-4bd4-bea6-b3059462309a	04-50-111-01	MAMOGRAFIA	Servicio importado: MAMOGRAFIA	individual	\N	\N	t	2025-08-17 03:17:16.050546
e31acc9e-593d-429f-93f6-578a6cc51601	04-04-012-01	ECOTOMOGRAFIA MAMARIA	Servicio importado: ECOTOMOGRAFIA MAMARIA	individual	\N	\N	t	2025-08-17 03:17:16.204675
f4f54aaa-051d-4e52-a1d0-f9ce3fddf6f1	04-50-110-01	MAMOGRAFIA	Servicio importado: MAMOGRAFIA	individual	\N	\N	t	2025-08-17 03:17:17.764638
e8b23aea-726a-45a3-8279-7e3bcc44cd14	26-06-014-01	URGENCIA ADULTO	Servicio importado: URGENCIA ADULTO	individual	\N	\N	t	2025-08-17 03:17:18.459552
23ccfd38-1780-4816-a78f-aa87a2fb077d	26-02-001-00	URGENCIA ADULTO	Servicio importado: URGENCIA ADULTO	individual	\N	\N	t	2025-08-17 03:17:18.615519
31213b13-f13a-4b25-ba31-20a43ccb6acb	04-01-055-01	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:17:19.1609
8bd39408-cc62-44fa-825f-dec9b8b5e0d5	08-01-005-01	HISTOPATOLOGIA	Servicio importado: HISTOPATOLOGIA	individual	\N	\N	t	2025-08-17 03:17:20.054681
58fcba76-9b43-4689-94a7-ad0411dc5150	04-01-052-01	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:17:20.222059
a3172027-8d40-4bea-bbcb-83aeab2cfe4a	04-05-017-01	RESONANCIA NUCLEAR MAGNETICA	Servicio importado: RESONANCIA NUCLEAR MAGNETICA	individual	\N	\N	t	2025-08-17 03:17:21.075234
37102bab-82d4-4623-accc-feb32f2693ec	04-03-014-01	MAIPU SCANNER	Servicio importado: MAIPU SCANNER	individual	\N	\N	t	2025-08-17 03:17:23.898079
ba3088f3-24b2-4c6d-bdc0-9c3c33d64ae0	05-01-102-01	MEDICINA NUCLEAR	Servicio importado: MEDICINA NUCLEAR	individual	\N	\N	t	2025-08-17 03:17:28.246909
ffdc0e97-a2fd-4dcb-b208-1341ea6d7333	05-01-136-01	MEDICINA NUCLEAR	Servicio importado: MEDICINA NUCLEAR	individual	\N	\N	t	2025-08-17 03:17:28.404958
ab78f172-aa3f-4e1c-ba2d-574510f39132	05-01-117-01	MEDICINA NUCLEAR	Servicio importado: MEDICINA NUCLEAR	individual	\N	\N	t	2025-08-17 03:17:28.564274
e5ca46ce-8e2f-42f7-8d2d-c1423e63d903	05-01-133-01	MEDICINA NUCLEAR	Servicio importado: MEDICINA NUCLEAR	individual	\N	\N	t	2025-08-17 03:17:28.839653
b9f2fde8-e399-41cd-9647-186944d1d755	05-01-105-01	MEDICINA NUCLEAR	Servicio importado: MEDICINA NUCLEAR	individual	\N	\N	t	2025-08-17 03:17:28.993398
5d9799d4-2e08-47c8-9fa2-dfbbcac64732	05-01-119-01	MEDICINA NUCLEAR	Servicio importado: MEDICINA NUCLEAR	individual	\N	\N	t	2025-08-17 03:17:29.748824
5041e125-434b-4d6b-852e-ed8a110b0010	17-01-006-01	MAIPU CARDIO PROCEDIMIENTOS	Servicio importado: MAIPU CARDIO PROCEDIMIENTOS	individual	\N	\N	t	2025-08-17 03:17:30.344241
51b80d45-0c10-4b97-a84e-be94b4c6e9f1	08-01-002-01	HISTOPATOLOGIA	Servicio importado: HISTOPATOLOGIA	individual	\N	\N	t	2025-08-17 03:17:32.648341
3009ae52-af06-4d7a-aee0-349d2e788692	04-04-005-01	ECOGRAFIA GINECO OBTETRICA	Servicio importado: ECOGRAFIA GINECO OBTETRICA	individual	\N	\N	t	2025-08-17 03:17:33.354003
8bdfe39f-c979-4315-b286-ced9e9418197	04-04-122-02	ECOGRAFIA GINECO OBTETRICA	Servicio importado: ECOGRAFIA GINECO OBTETRICA	individual	\N	\N	t	2025-08-17 03:17:33.515921
3c409119-a5ed-40b7-9c9f-54a8f182c4b1	04-04-006-04	ECOGRAFIA GINECO OBTETRICA	Servicio importado: ECOGRAFIA GINECO OBTETRICA	individual	\N	\N	t	2025-08-17 03:17:33.679493
fd9c37e3-e1e4-4fa7-93c0-a72adbac41de	04-01-033-01	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:17:35.369982
543ab806-e0a2-476f-8b7f-0850f8562cc9	04-01-151-01	MAIPU RADIOLOGIA	Servicio importado: MAIPU RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:17:35.718441
035902ea-4d53-4afb-983b-af38dc0b83f8	04-01-002-01	MAIPU RADIOLOGIA	Servicio importado: MAIPU RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:17:36.344665
285732f2-16fa-44d1-8a01-c80cace97516	05-01-134-00	DENSITOMETRIA	Servicio importado: DENSITOMETRIA	individual	\N	\N	t	2025-08-17 03:17:38.437629
8e95cb3d-7a38-41e9-96bc-f90c64106278	26-05-002-00	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:17:41.27199
4b419351-74a7-4e79-8f11-c4ff75a0457c	26-09-006-00	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:17:41.434552
61b785e0-c599-462f-abe4-c5d1e1bf1854	26-01-023-01	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:17:41.709127
6069611d-564b-4407-8eb8-f8449d4894b8	26-01-017-01	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:17:41.870519
cb86b393-5e7c-4bac-8a83-cb8d95b60c5d	19-01-016-01	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:17:42.026307
353e06e7-42c5-4fff-a6a7-d40cd21fdc8c	04-50-015-02	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:17:42.256282
b723b77a-3fb4-4a32-b72c-36eaddebc0a4	22-01-001-02	MAIPU SALA DE PROCEDIMIENTOS	Servicio importado: MAIPU SALA DE PROCEDIMIENTOS	individual	\N	\N	t	2025-08-17 03:17:42.579849
f457a03e-20e5-449c-8b32-0446e601cdee	16-02-204-02	MAIPU SALA DE PROCEDIMIENTOS	Servicio importado: MAIPU SALA DE PROCEDIMIENTOS	individual	\N	\N	t	2025-08-17 03:17:42.734065
fbbdbdc7-acc7-4fc6-ad89-6185441e01cb	18-50-033-02	PROCEDIMIENTOS DE GASTROENTEROLOGIA	Servicio importado: PROCEDIMIENTOS DE GASTROENTEROLOGIA	individual	\N	\N	t	2025-08-17 03:17:42.964219
b19f634b-032b-424d-9e3c-8130185e4648	18-01-007-02	PROCEDIMIENTOS DE GASTROENTEROLOGIA	Servicio importado: PROCEDIMIENTOS DE GASTROENTEROLOGIA	individual	\N	\N	t	2025-08-17 03:17:43.123708
ebcf7758-7f07-4d0c-baef-eb963545995d	18-01-001-02	PROCEDIMIENTOS DE GASTROENTEROLOGIA	Servicio importado: PROCEDIMIENTOS DE GASTROENTEROLOGIA	individual	\N	\N	t	2025-08-17 03:17:43.283803
ef772d4c-6c2e-4e44-8a4c-045978c06f5c	21-05-004-01	TRAUMATOLOGIA	Servicio importado: TRAUMATOLOGIA	individual	\N	\N	t	2025-08-17 03:17:43.871522
59f0bd16-5367-4b51-8d3f-1a15697ae389	21-05-006-01	TRAUMATOLOGIA	Servicio importado: TRAUMATOLOGIA	individual	\N	\N	t	2025-08-17 03:17:44.174126
d79f73e7-2184-4d4d-9a95-fa3ebf5cb59d	19-01-030-02	PROCEDIMIENTOS UROLOGICOS	Servicio importado: PROCEDIMIENTOS UROLOGICOS	individual	\N	\N	t	2025-08-17 03:17:44.407923
60eb05f2-9b76-4477-a543-96cb84885ba4	19-01-003-02	PROCEDIMIENTOS UROLOGICOS	Servicio importado: PROCEDIMIENTOS UROLOGICOS	individual	\N	\N	t	2025-08-17 03:17:44.643862
224d2fdd-d34d-4842-9829-e7b0f5fae9f1	18-01-025-02	PROCEDIMIENTOS DE GASTROENTEROLOGIA	Servicio importado: PROCEDIMIENTOS DE GASTROENTEROLOGIA	individual	\N	\N	t	2025-08-17 03:17:44.877527
f73b7c23-591d-44e1-9e69-ff828bde145f	18-01-006-02	PROCEDIMIENTOS DE GASTROENTEROLOGIA	Servicio importado: PROCEDIMIENTOS DE GASTROENTEROLOGIA	individual	\N	\N	t	2025-08-17 03:17:45.035329
53a8366b-c392-4585-b39a-8c6ba6d3d79d	04-03-019-01	SCANNER	Servicio importado: SCANNER	individual	\N	\N	t	2025-08-17 03:17:48.115271
02aa258a-4fb1-4485-b168-e4780edd98ab	08-01-004-01	HISTOPATOLOGIA	Servicio importado: HISTOPATOLOGIA	individual	\N	\N	t	2025-08-17 03:17:48.393159
f0c41bc3-91a4-453a-b726-4649b622e10a	20-50-009-01	UNIDAD DE MEDICINA REPRODUCTIVA	Servicio importado: UNIDAD DE MEDICINA REPRODUCTIVA	individual	\N	\N	t	2025-08-17 03:17:51.222697
1be97f14-fb37-4762-8919-8af2d8920761	20-01-015-01	PROCEDIMIENTOS GINECO OBTETRICOS	Servicio importado: PROCEDIMIENTOS GINECO OBTETRICOS	individual	\N	\N	t	2025-08-17 03:17:51.967238
773521cb-ed8b-46d1-ab9a-0d21a3351d31	13-01-003-01	PROCEDIMIENTOS DE OTORRINO	Servicio importado: PROCEDIMIENTOS DE OTORRINO	individual	\N	\N	t	2025-08-17 03:17:52.213036
b2f017b0-897d-42bd-ba0e-0a2f3c7259af	18-01-045-02	MAIPU GASTROENTEROLOGIA	Servicio importado: MAIPU GASTROENTEROLOGIA	individual	\N	\N	t	2025-08-17 03:17:52.898025
17c62d02-8bd5-417f-a6c6-b13ab13e1214	21-01-001-01	TRAUMATOLOGIA	Servicio importado: TRAUMATOLOGIA	individual	\N	\N	t	2025-08-17 03:17:53.911185
236d0303-1c2e-487b-bd07-a26033107132	16-01-116-01	SALA DE PROCEDIMIENTOS LOS ESPAÑOLES	Servicio importado: SALA DE PROCEDIMIENTOS LOS ESPAÑOLES	individual	\N	\N	t	2025-08-17 03:17:54.146092
78afb3d3-eb6e-4e3e-bdaf-ccce1b247292	04-01-014-01	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:18:00.739891
6c2b067a-977c-4388-871b-3cc03d5b0f7a	04-01-013-01	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:18:00.913746
c95aa66b-09f9-45af-b467-1fa279c65cba	04-05-024-01	RESONANCIA NUCLEAR MAGNETICA	Servicio importado: RESONANCIA NUCLEAR MAGNETICA	individual	\N	\N	t	2025-08-17 03:18:01.783349
5597bff8-d8b3-4755-af3a-31fd83cee4f5	04-04-122-03	MAIPU ECOGRAFIA	Servicio importado: MAIPU ECOGRAFIA	individual	\N	\N	t	2025-08-17 03:18:02.818235
df723da4-18ac-4f8e-af5f-143f30397532	04-04-121-05	ECOGRAFIA GINECO OBTETRICA	Servicio importado: ECOGRAFIA GINECO OBTETRICA	individual	\N	\N	t	2025-08-17 03:18:03.890133
cb7d1a9e-eead-4c95-8d34-a9c141cccbea	04-04-402-01	ECOGRAFIA GINECO OBTETRICA	Servicio importado: ECOGRAFIA GINECO OBTETRICA	individual	\N	\N	t	2025-08-17 03:18:04.399595
3415fe21-d348-4d16-a834-6d631782cc19	04-05-012-01	MAIPU RESONANCIA NUCLEAR MAGNETICA	Servicio importado: MAIPU RESONANCIA NUCLEAR MAGNETICA	individual	\N	\N	t	2025-08-17 03:18:05.394297
c0d66b8a-898c-4056-8672-689a73671487	04-04-006-03	ECOTOMOGRAFIA GENERAL	Servicio importado: ECOTOMOGRAFIA GENERAL	individual	\N	\N	t	2025-08-17 03:18:09.208323
97a98ce0-e83e-4e20-ac23-e47af39dc7ab	04-04-122-00	ECOGRAFIA GINECO OBTETRICA	Servicio importado: ECOGRAFIA GINECO OBTETRICA	individual	\N	\N	t	2025-08-17 03:18:11.378806
7d1cb523-745a-414e-9ab0-8e74bbeb8333	04-05-007-01	RESONANCIA NUCLEAR MAGNETICA	Servicio importado: RESONANCIA NUCLEAR MAGNETICA	individual	\N	\N	t	2025-08-17 03:18:11.537475
e133972e-3eb0-4c46-9687-9d6ff7a8809b	04-01-032-01	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:18:12.654171
0c8b2fb4-da42-490f-bc64-d2221f99570b	04-01-043-01	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:18:13.922113
df6e1126-8222-40dc-99eb-1136b7d92373	04-04-119-01	ECOTOMOGRAFIA GENERAL	Servicio importado: ECOTOMOGRAFIA GENERAL	individual	\N	\N	t	2025-08-17 03:18:16.699273
af73064f-de5b-47ae-87ab-cb5ecf95b4e8	04-05-005-01	RESONANCIA NUCLEAR MAGNETICA	Servicio importado: RESONANCIA NUCLEAR MAGNETICA	individual	\N	\N	t	2025-08-17 03:18:18.114734
74e90194-049f-4fda-ac87-d79d0252b21f	17-01-045-02	CARDIO PROCEDIMIENTOS	Servicio importado: CARDIO PROCEDIMIENTOS	individual	\N	\N	t	2025-08-17 03:18:21.269847
db90504a-f2ba-4859-8b9f-a31e7ecbd870	CARGOS/DCTOS	MONITOREO DE PRESION ARTERIAL	Servicio importado: MONITOREO DE PRESION ARTERIAL	individual	\N	\N	t	2025-08-17 03:18:35.137957
ced4f019-8442-4f9c-9178-81ce32706a3a	04-03-103-01	SCANNER	Servicio importado: SCANNER	individual	\N	\N	t	2025-08-17 03:18:39.44044
0f4a21c8-cb29-4f29-82a2-767e7abe3edf	99-00-082-01	MAIPU URGENCIA ADULTO	Servicio importado: MAIPU URGENCIA ADULTO	individual	\N	\N	t	2025-08-17 03:18:41.453937
c136ac7d-e39f-482e-86f6-365de1d34620	99-00-073-01	MAIPU URGENCIA ADULTO	Servicio importado: MAIPU URGENCIA ADULTO	individual	\N	\N	t	2025-08-17 03:18:41.616367
5555441a-c0b5-498d-ab2c-581e7f862366	60-00-063-01	URGENCIA PEDIATRIA	Servicio importado: URGENCIA PEDIATRIA	individual	\N	\N	t	2025-08-17 03:18:41.846301
0e249e67-45a7-4fdf-9968-8d68ce90a2be	15-02-002-02	URGENCIA ADULTO	Servicio importado: URGENCIA ADULTO	individual	\N	\N	t	2025-08-17 03:18:42.119887
6ec31f7a-163a-43f5-abab-cf1db5a4099f	15-02-001-02	URGENCIA ADULTO	Servicio importado: URGENCIA ADULTO	individual	\N	\N	t	2025-08-17 03:18:42.27809
c20687ef-99b1-468b-94fa-4960217a3750	26-09-009-01	URGENCIA ADULTO	Servicio importado: URGENCIA ADULTO	individual	\N	\N	t	2025-08-17 03:18:42.510104
de600b91-2c27-4613-a9a8-d05176e286b2	26-02-037-00	URGENCIA ADULTO	Servicio importado: URGENCIA ADULTO	individual	\N	\N	t	2025-08-17 03:18:42.66726
4a3aecff-6225-4efa-8d01-327ac9064195	26-07-005-00	URGENCIA ADULTO	Servicio importado: URGENCIA ADULTO	individual	\N	\N	t	2025-08-17 03:18:43.018455
29ab0442-8da9-4594-bcbc-b2bfc43c43b3	04-04-014-01	ECOTOMOGRAFIA GENERAL	Servicio importado: ECOTOMOGRAFIA GENERAL	individual	\N	\N	t	2025-08-17 03:18:44.489158
0578bc50-7bae-47f7-a35c-fcbf9fc417c2	04-05-098-00	RESONANCIA NUCLEAR MAGNETICA	Servicio importado: RESONANCIA NUCLEAR MAGNETICA	individual	\N	\N	t	2025-08-17 03:18:48.218115
03cf1110-fc97-405b-8104-a9daebaea21f	17-07-002-01	MAIPU BRONCOPULMONAR	Servicio importado: MAIPU BRONCOPULMONAR	individual	\N	\N	t	2025-08-17 03:18:51.489635
ad60b2ec-dd8e-45fc-9116-2df644a7807e	04-01-130-01	MAMOGRAFIA	Servicio importado: MAMOGRAFIA	individual	\N	\N	t	2025-08-17 03:18:51.724062
d099b082-6aa0-44d1-879e-649e95b836a0	04-01-010-01	MAMOGRAFIA	Servicio importado: MAMOGRAFIA	individual	\N	\N	t	2025-08-17 03:18:52.116999
c4a0047e-90ad-45e0-a72e-a9a01800c91c	04-05-016-01	RESONANCIA NUCLEAR MAGNETICA	Servicio importado: RESONANCIA NUCLEAR MAGNETICA	individual	\N	\N	t	2025-08-17 03:18:53.876348
fecb5bdb-909f-4f25-ac09-da37b9bf3d91	18-01-031-02	PROCEDIMIENTOS DE GASTROENTEROLOGIA	Servicio importado: PROCEDIMIENTOS DE GASTROENTEROLOGIA	individual	\N	\N	t	2025-08-17 03:18:57.151693
bf20c1ca-1cf6-4a2d-9624-47f863d3a915	20-01-014-02	SALA DE PROCEDIMIENTOS TORRE A	Servicio importado: SALA DE PROCEDIMIENTOS TORRE A	individual	\N	\N	t	2025-08-17 03:18:58.365193
977f6041-702e-43c1-a71e-74ece9406dd3	20-01-002-01	SALA DE PROCEDIMIENTOS TORRE A	Servicio importado: SALA DE PROCEDIMIENTOS TORRE A	individual	\N	\N	t	2025-08-17 03:18:58.641204
7e92594b-8c95-4ffb-8d5e-2ee102e1ed5e	04-06-001-02	RESONANCIA NUCLEAR MAGNETICA	Servicio importado: RESONANCIA NUCLEAR MAGNETICA	individual	\N	\N	t	2025-08-17 03:18:58.988464
e25a1058-7de1-42a6-b0e0-0d3dc6385ebc	04-03-018-01	SCANNER	Servicio importado: SCANNER	individual	\N	\N	t	2025-08-17 03:18:59.914157
dc3d9202-1a6e-4517-9d71-a16337ee93d7	04-04-218-01	ECOTOMOGRAFIA GENERAL	Servicio importado: ECOTOMOGRAFIA GENERAL	individual	\N	\N	t	2025-08-17 03:19:03.908548
30e5b798-8e37-4bed-aa6e-6d9a24a63960	04-03-023-01	SCANNER	Servicio importado: SCANNER	individual	\N	\N	t	2025-08-17 03:19:04.553946
688952fb-43ae-4e0e-b446-9ace0dac5dc6	20-01-009-01	MONITOREO FETAL	Servicio importado: MONITOREO FETAL	individual	\N	\N	t	2025-08-17 03:19:06.007712
fa450859-eeb8-4281-ae64-884d9239699c	01-03-003-01	MONITOREO FETAL	Servicio importado: MONITOREO FETAL	individual	\N	\N	t	2025-08-17 03:19:06.178806
34f22338-7205-4e27-bf51-ee445bcf42d6	11-01-012-01	MEDICINA FISICA	Servicio importado: MEDICINA FISICA	individual	\N	\N	t	2025-08-17 03:19:07.713614
54220af0-4148-48a0-a5ae-315011e8dbd9	11-01-010-01	MEDICINA FISICA	Servicio importado: MEDICINA FISICA	individual	\N	\N	t	2025-08-17 03:19:07.87301
44e4ee62-36de-4516-9acd-a5ecebe925cc	18-50-011-01	PROCEDIMIENTOS DE GASTROENTEROLOGIA	Servicio importado: PROCEDIMIENTOS DE GASTROENTEROLOGIA	individual	\N	\N	t	2025-08-17 03:19:08.237573
61e09c28-56a9-45ba-8826-bb7372d3f56a	18-50-011-00	PROCEDIMIENTOS DE GASTROENTEROLOGIA	Servicio importado: PROCEDIMIENTOS DE GASTROENTEROLOGIA	individual	\N	\N	t	2025-08-17 03:19:08.515578
90c31227-fa35-454f-8407-47cda26e46e5	04-05-010-01	RESONANCIA NUCLEAR MAGNETICA	Servicio importado: RESONANCIA NUCLEAR MAGNETICA	individual	\N	\N	t	2025-08-17 03:19:11.064005
4ca05950-a10d-4493-9bee-43cd670d91fc	04-01-044-01	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:19:18.454802
3638a6a7-7c3c-4682-b254-78c38853e988	04-03-012-01	SCANNER	Servicio importado: SCANNER	individual	\N	\N	t	2025-08-17 03:19:25.573413
22b54437-42d0-43dc-81c3-18c68c3ef67f	04-01-053-01	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:19:27.654754
9592b667-ffbf-42b1-819d-d60768b4faec	04-03-025-01	SCANNER	Servicio importado: SCANNER	individual	\N	\N	t	2025-08-17 03:19:36.257137
f1707dfc-1c43-4259-8515-d7cdebd42ca1	04-03-102-02	SCANNER	Servicio importado: SCANNER	individual	\N	\N	t	2025-08-17 03:19:36.411799
08e48328-608e-4c45-ab92-b1c281b7b5ba	04-03-106-01	SCANNER	Servicio importado: SCANNER	individual	\N	\N	t	2025-08-17 03:19:36.567916
cb3f33f0-4127-40cd-8137-9fdf8fbb0c84	04-03-101-01	SCANNER	Servicio importado: SCANNER	individual	\N	\N	t	2025-08-17 03:19:37.440431
800ea267-cc26-47ee-84e7-ebf55e3ac493	99-00-098-01	URGENCIA ADULTO	Servicio importado: URGENCIA ADULTO	individual	\N	\N	t	2025-08-17 03:19:40.686098
092b8e4e-bfb6-4ca8-a427-8e4ba8e353f7	04-03-008-01	SCANNER	Servicio importado: SCANNER	individual	\N	\N	t	2025-08-17 03:19:52.731534
20701a15-c185-4987-932e-311a61c4b98b	04-03-107-01	SCANNER	Servicio importado: SCANNER	individual	\N	\N	t	2025-08-17 03:19:53.022161
5495f6b2-273a-44d2-a668-41bb54675735	26-02-011-00	URGENCIA ADULTO	Servicio importado: URGENCIA ADULTO	individual	\N	\N	t	2025-08-17 03:19:53.535061
989a039f-70b0-4c8f-9f66-3f0f30ec5781	26-03-011-00	URGENCIA ADULTO	Servicio importado: URGENCIA ADULTO	individual	\N	\N	t	2025-08-17 03:19:54.115861
6ab171e3-d4bb-40f6-b6b5-bfe77815652b	60-00-062-01	URGENCIA PEDIATRIA	Servicio importado: URGENCIA PEDIATRIA	individual	\N	\N	t	2025-08-17 03:19:54.467211
e1f5ecbe-d26a-4904-b29b-dabf1a0d9028	04-01-008-01	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:19:54.740801
fbc25ab3-761d-40e7-9799-abc526a9ea19	08-01-007-01	HISTOPATOLOGIA	Servicio importado: HISTOPATOLOGIA	individual	\N	\N	t	2025-08-17 03:19:56.806112
6f842206-897b-43bd-83a9-18a36f6d3f92	04-04-011-01	ECOTOMOGRAFIA GENERAL	Servicio importado: ECOTOMOGRAFIA GENERAL	individual	\N	\N	t	2025-08-17 03:19:58.697447
4000e6cd-08ad-4e23-9f22-66fd6b59382d	04-04-121-06	ECOGRAFIA GINECO OBTETRICA	Servicio importado: ECOGRAFIA GINECO OBTETRICA	individual	\N	\N	t	2025-08-17 03:20:00.824122
0b9842b9-2792-42e4-9149-cb833b6bcb33	04-05-101-01	RESONANCIA NUCLEAR MAGNETICA	Servicio importado: RESONANCIA NUCLEAR MAGNETICA	individual	\N	\N	t	2025-08-17 03:20:01.109692
50865fba-cad1-4750-9ef5-464cba73d51b	04-01-045-01	MAIPU RADIOLOGIA	Servicio importado: MAIPU RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:20:10.088962
402dd2f5-fdce-49d6-aa40-728ea429dfb2	26-02-012-00	URGENCIA ADULTO	Servicio importado: URGENCIA ADULTO	individual	\N	\N	t	2025-08-17 03:20:15.887432
09bcdd5a-47a9-4619-8524-669b2945f346	18-50-011-02	PROCEDIMIENTOS DE GASTROENTEROLOGIA	Servicio importado: PROCEDIMIENTOS DE GASTROENTEROLOGIA	individual	\N	\N	t	2025-08-17 03:20:21.916704
dca230bd-a86e-46c9-8e00-8e53cfc37067	01-50-003-00	CONSULTAS 04 LC MEDICINA PREVENTIVA	Servicio importado: CONSULTAS 04 LC MEDICINA PREVENTIVA	individual	\N	\N	t	2025-08-17 03:20:22.268163
b269eac7-8d9a-4b07-be50-c26da1a8c9b6	26-01-000-00	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:20:22.89011
5716a89c-3ace-4bf1-93c8-a745df31e7de	11-50-044-00	ELECTROENCEFALOGRAFIA	Servicio importado: ELECTROENCEFALOGRAFIA	individual	\N	\N	t	2025-08-17 03:20:23.126209
a79a9c0e-2a92-476b-a738-f9475da1bf48	04-05-002-01	RESONANCIA NUCLEAR MAGNETICA	Servicio importado: RESONANCIA NUCLEAR MAGNETICA	individual	\N	\N	t	2025-08-17 03:20:46.957397
4521c362-d079-460b-870d-20139c749e48	04-50-015-00	ECOTOMOGRAFIA GENERAL	Servicio importado: ECOTOMOGRAFIA GENERAL	individual	\N	\N	t	2025-08-17 03:20:47.123187
ae0ef338-ae60-44a3-a1f0-6945d108e37f	04-05-009-02	RESONANCIA NUCLEAR MAGNETICA	Servicio importado: RESONANCIA NUCLEAR MAGNETICA	individual	\N	\N	t	2025-08-17 03:20:53.915899
0fb0f06d-c060-48e8-9f1b-fdfcd933f996	04-05-019-02	RESONANCIA NUCLEAR MAGNETICA	Servicio importado: RESONANCIA NUCLEAR MAGNETICA	individual	\N	\N	t	2025-08-17 03:20:54.074338
6165b630-c769-497f-bbfb-406239410b4c	05-01-104-01	MEDICINA NUCLEAR	Servicio importado: MEDICINA NUCLEAR	individual	\N	\N	t	2025-08-17 03:20:56.287844
794d9623-1d05-4790-bbdc-a58a1e1b4e27	04-05-006-01	MAIPU RESONANCIA NUCLEAR MAGNETICA	Servicio importado: MAIPU RESONANCIA NUCLEAR MAGNETICA	individual	\N	\N	t	2025-08-17 03:21:17.042467
9fc73a7c-4ae4-4290-a6d6-a89762e51386	08-01-006-01	HISTOPATOLOGIA	Servicio importado: HISTOPATOLOGIA	individual	\N	\N	t	2025-08-17 03:35:55.413406
76641e70-ae14-499d-8b2c-39f860196487	16-02-203-02	SALA DE PROCEDIMIENTOS TORRE A	Servicio importado: SALA DE PROCEDIMIENTOS TORRE A	individual	\N	\N	t	2025-08-17 03:36:01.192678
a42988ca-1cd6-4162-ab1a-97da45804069	04-50-110-00	MAMOGRAFIA	Servicio importado: MAMOGRAFIA	individual	\N	\N	t	2025-08-17 03:36:09.10523
ea25308b-f2ef-4097-ad15-f3fe2b3fe4a5	04-04-403-01	ECOGRAFIA GINECO OBTETRICA	Servicio importado: ECOGRAFIA GINECO OBTETRICA	individual	\N	\N	t	2025-08-17 03:36:18.648143
699281c1-db6f-4a2e-99ac-0ebc425b4209	01-01-019-01	URGENCIA ADULTO	Servicio importado: URGENCIA ADULTO	individual	\N	\N	t	2025-08-17 03:36:36.700154
0dc18d5c-0d67-4a3f-b27b-6a6fec896036	26-02-005-00	MAIPU URGENCIA ADULTO	Servicio importado: MAIPU URGENCIA ADULTO	individual	\N	\N	t	2025-08-17 03:36:37.242195
3a1eed40-e121-4ddc-8f41-590724fa248c	16-02-221-02	MAIPU URGENCIA PEDIATRICA	Servicio importado: MAIPU URGENCIA PEDIATRICA	individual	\N	\N	t	2025-08-17 03:36:37.523428
b898ad84-867d-46f8-9147-dd31060da63d	60-00-140-01	URGENCIA ADULTO	Servicio importado: URGENCIA ADULTO	individual	\N	\N	t	2025-08-17 03:36:37.991659
880b47fc-e037-4e66-bc4b-0d26e2cae3ad	14-01-001-02	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:37:06.205704
bc43c319-b19f-46a3-967b-d4826ac49753	14-01-001-01	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:37:06.361137
c5737930-af22-42a0-9707-5364272e6434	08-01-001-11	HISTOPATOLOGIA	Servicio importado: HISTOPATOLOGIA	individual	\N	\N	t	2025-08-17 03:37:32.605536
a074e449-caed-4b3f-b5ab-f859eb7883f4	26-08-027-00	URGENCIA ADULTO	Servicio importado: URGENCIA ADULTO	individual	\N	\N	t	2025-08-17 03:37:46.292635
1757d113-02b7-4e52-9384-78f99a216e99	04-05-018-01	RESONANCIA NUCLEAR MAGNETICA	Servicio importado: RESONANCIA NUCLEAR MAGNETICA	individual	\N	\N	t	2025-08-17 03:37:50.249712
cf02add9-970b-4604-965f-ea5b772e8ad8	26-07-031-00	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:37:51.248055
131d40a9-8abf-4ab1-b9ce-3fa02f5bac7b	26-07-019-00	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:37:51.40512
47bdec5b-d050-4135-9454-b5c955f504cc	26-01-018-01	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:37:52.121297
e882f24f-b08e-4454-9302-9f934a6d02c9	26-06-009-00	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:37:52.51996
f01d0ab0-2371-4337-b5ae-9d123631b020	26-06-001-00	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:37:52.794152
928d62b6-30de-4880-b037-476ab5493d9c	26-06-010-01	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:37:53.068248
714c47ba-2a43-4599-b0f5-d47177b009e2	26-03-009-00	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:37:53.457114
3cc914d8-b643-4af4-815b-040178fff959	17-01-045-01	ECOGRAFIA GINECO OBTETRICA	Servicio importado: ECOGRAFIA GINECO OBTETRICA	individual	\N	\N	t	2025-08-17 03:37:59.78106
6380aea2-bbd5-4e66-8cbc-a77e38970bee	04-02-014-01	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:38:06.606097
82db1659-4b9a-4335-8657-029b0d435130	26-05-009-00	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:38:16.380784
3d98f15a-af1d-4500-a551-46a0bc63c884	26-13-028-02	SALA DE PROCEDIMIENTOS TORRE A	Servicio importado: SALA DE PROCEDIMIENTOS TORRE A	individual	\N	\N	t	2025-08-17 03:38:16.850706
5bf01707-6a83-4add-9829-3294c9ddafb2	11-01-043-01	ELECTROENCEFALOGRAFIA	Servicio importado: ELECTROENCEFALOGRAFIA	individual	\N	\N	t	2025-08-17 03:38:17.005827
1ac6f641-ab59-4835-aacc-3804334f1e54	04-03-006-01	MAIPU SCANNER	Servicio importado: MAIPU SCANNER	individual	\N	\N	t	2025-08-17 03:38:21.807552
afb3b8c7-92d6-4c62-94f2-7ed3f27186cb	22-01-001-03	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:39:03.666037
487678f5-7397-4e1e-8ad6-98cd3996afb7	04-04-414-06	ECOTOMOGRAFIA MAMARIA	Servicio importado: ECOTOMOGRAFIA MAMARIA	individual	\N	\N	t	2025-08-17 03:39:04.20565
88364698-1f6b-4d76-b55e-83b3fc990b31	04-01-063-01	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:39:19.963133
aaee6deb-2509-4514-96a6-7489d03c39b6	26-13-001-04	SALA DE PROCEDIMIENTOS TORRE A	Servicio importado: SALA DE PROCEDIMIENTOS TORRE A	individual	\N	\N	t	2025-08-17 03:39:27.125089
7510b8b5-ef2e-4e36-a141-f7c613145fbb	26-03-018-02	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:39:27.830416
71baa9a4-a398-47ba-be28-9fa463ab422c	04-04-120-01	ECOTOMOGRAFIA GENERAL	Servicio importado: ECOTOMOGRAFIA GENERAL	individual	\N	\N	t	2025-08-17 03:39:31.14223
3625c17e-7ffe-4c2b-8ec9-9c6b8ce4521c	17-07-004-01	MAIPU BRONCOPULMONAR	Servicio importado: MAIPU BRONCOPULMONAR	individual	\N	\N	t	2025-08-17 03:39:31.811635
a04f23d0-3825-4a06-8f5d-caa9c74192a4	04-01-064-01	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:39:41.954172
cc143d4e-b601-4e0c-9bab-bd2c23a92fe2	17-01-004-01	CARDIO INTERV Y TERAP ENDOVASCULAR	Servicio importado: CARDIO INTERV Y TERAP ENDOVASCULAR	individual	\N	\N	t	2025-08-17 03:40:04.104484
7e94d900-230c-487c-ac56-bad3ad3c9bc9	11-01-050-01	CENTRO DEL SUEÑO	Servicio importado: CENTRO DEL SUEÑO	individual	\N	\N	t	2025-08-17 03:40:04.453236
e43ec95c-ecb2-40e9-9bd9-30fc429c28e0	04-05-026-01	RESONANCIA NUCLEAR MAGNETICA	Servicio importado: RESONANCIA NUCLEAR MAGNETICA	individual	\N	\N	t	2025-08-17 03:40:05.754718
2d00de2a-454c-4983-802b-7cc94ddbf257	04-04-413-01	ECOGRAFIA GINECO OBTETRICA	Servicio importado: ECOGRAFIA GINECO OBTETRICA	individual	\N	\N	t	2025-08-17 03:40:11.46449
6108103b-ee1a-4542-b855-60ce3c4d45dc	26-08-004-00	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:40:15.714996
f7b79779-421a-41e8-8148-e15ff5ff70d0	21-05-007-01	TRAUMATOLOGIA	Servicio importado: TRAUMATOLOGIA	individual	\N	\N	t	2025-08-17 03:40:16.840112
196ca197-527e-416e-9a7b-abe0f01b5698	04-01-019-01	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:40:23.457196
1c0c5bd4-0f65-41f3-b9ab-d3c81517e2f0	16-02-202-02	SALA DE PROCEDIMIENTOS TORRE A	Servicio importado: SALA DE PROCEDIMIENTOS TORRE A	individual	\N	\N	t	2025-08-17 03:40:39.566712
cdcd1970-567d-47db-b399-872eb2275e9a	26-03-008-01	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:40:40.232351
18319f43-fd86-4599-8071-8654e01dad8d	26-01-006-03	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:40:41.3471
e87032bf-7308-415b-95d8-7ac628334875	26-03-010-01	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:40:41.501153
01017456-40d2-43b4-847f-4700c49ed98f	26-01-001-00	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:40:42.046508
81aae3e3-1e81-4bec-86e6-809465207515	26-07-001-01	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:40:42.398755
e84fb723-77d8-499a-b509-576d38fd0d46	04-50-003-02	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:40:43.620525
baee57fc-3c1f-4960-bf78-43882dec99e7	04-50-007-02	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:40:43.775363
d8866a87-aa1f-46bb-8007-e6d33fe7dbf8	18-01-026-02	PROCEDIMIENTOS DE GASTROENTEROLOGIA	Servicio importado: PROCEDIMIENTOS DE GASTROENTEROLOGIA	individual	\N	\N	t	2025-08-17 03:40:44.128713
168971e6-4c7e-4861-8fb1-2067b87568ba	18-02-014-02	MAIPU GASTROENTEROLOGIA	Servicio importado: MAIPU GASTROENTEROLOGIA	individual	\N	\N	t	2025-08-17 03:40:44.410114
84e76b97-c389-4803-a567-e6b092086333	18-01-033-02	PROCEDIMIENTOS DE GASTROENTEROLOGIA	Servicio importado: PROCEDIMIENTOS DE GASTROENTEROLOGIA	individual	\N	\N	t	2025-08-17 03:40:44.566586
76a09429-b947-41bb-a751-de49efbe8db0	17-01-055-01	CARDIO PROCEDIMIENTOS	Servicio importado: CARDIO PROCEDIMIENTOS	individual	\N	\N	t	2025-08-17 03:41:37.134353
88899af2-22b3-443f-b41a-4d71f98447a1	26-00-030-00	RADIOLOGIA DENTAL	Servicio importado: RADIOLOGIA DENTAL	individual	\N	\N	t	2025-08-17 03:41:53.877851
770b07c6-8545-4b31-a4b8-ac0de3e1f313	26-00-043-01	RADIOLOGIA DENTAL	Servicio importado: RADIOLOGIA DENTAL	individual	\N	\N	t	2025-08-17 03:41:54.036064
647a22ef-573d-4e53-a91c-98eb8ca4bcdc	26-00-010-01	RADIOLOGIA DENTAL	Servicio importado: RADIOLOGIA DENTAL	individual	\N	\N	t	2025-08-17 03:41:54.436411
ac5c127e-8d1d-4dba-8c4a-2aa9d7501ad9	26-00-030-01	RADIOLOGIA DENTAL	Servicio importado: RADIOLOGIA DENTAL	individual	\N	\N	t	2025-08-17 03:41:55.192618
9646e518-5057-4305-8101-5ca8ceb8e391	26-00-010-00	RADIOLOGIA DENTAL	Servicio importado: RADIOLOGIA DENTAL	individual	\N	\N	t	2025-08-17 03:41:55.940307
ceeeee9a-25cb-4b6c-9ff5-f7bed0da08a1	04-01-020-01	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:42:00.157596
1b62188b-ed2e-4c01-bc51-a3c908379346	04-03-902-01	SCANNER	Servicio importado: SCANNER	individual	\N	\N	t	2025-08-17 03:42:08.021308
0b395eed-e270-4337-8a3f-fd372f8bd725	26-01-068-01	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:42:09.009159
3735f06d-cd0d-4daf-8da6-ad220a738d72	06-50-004-05	MEDICINA FISICA	Servicio importado: MEDICINA FISICA	individual	\N	\N	t	2025-08-17 03:42:09.238467
f03691a1-8151-48dc-9b9a-941be1bacda8	11-01-041-01	MAIPU ELECTROENCEFALOGRAFIA	Servicio importado: MAIPU ELECTROENCEFALOGRAFIA	individual	\N	\N	t	2025-08-17 03:42:11.275641
3a46f8ba-36af-4afc-9130-b19bf35971ce	06-50-004-04	MEDICINA FISICA	Servicio importado: MEDICINA FISICA	individual	\N	\N	t	2025-08-17 03:42:20.403883
0bdb84f5-f6f1-4630-8683-5d90105654b5	20-01-016-02	PROCEDIMIENTOS GINECO OBTETRICOS	Servicio importado: PROCEDIMIENTOS GINECO OBTETRICOS	individual	\N	\N	t	2025-08-17 03:42:21.512394
41f4050d-bbae-4619-bf21-ca7bad5b8a69	04-01-010-11	MAMOGRAFIA	Servicio importado: MAMOGRAFIA	individual	\N	\N	t	2025-08-17 03:42:28.546071
8f02598a-d831-4e46-b353-8db8edf32b8f	17-07-005-01	MAIPU BRONCOPULMONAR	Servicio importado: MAIPU BRONCOPULMONAR	individual	\N	\N	t	2025-08-17 03:42:37.791925
ba6bec4b-63c6-435b-bf35-47f7d6ccd76b	04-05-029-01	RESONANCIA NUCLEAR MAGNETICA	Servicio importado: RESONANCIA NUCLEAR MAGNETICA	individual	\N	\N	t	2025-08-17 03:42:42.106213
e4f36f8d-41b4-4a64-bce8-f0c5cf35f836	26-03-014-00	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:42:44.896483
97813f1d-051a-45e5-b7c9-e1f7fe0d6f0c	26-06-014-02	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:42:45.134354
0411b9a8-8d9f-420e-b6e2-88b35dafdcd6	26-04-009-00	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:42:45.295803
84807ac8-cec5-4109-9a85-96f5ad79dbdd	26-04-004-00	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:42:45.480893
df8e4488-9924-4b05-87c0-d6f1cdf9ca4d	26-00-060-01	RADIOLOGIA DENTAL	Servicio importado: RADIOLOGIA DENTAL	individual	\N	\N	t	2025-08-17 03:42:45.7811
07b15448-bc18-4375-999e-44ab6c2a5893	26-00-059-01	RADIOLOGIA DENTAL	Servicio importado: RADIOLOGIA DENTAL	individual	\N	\N	t	2025-08-17 03:42:45.948335
d2f8f826-45d1-46fb-84d8-53ad80c9074c	17-07-008-01	LABORATORIO BRONCOPULMONAR	Servicio importado: LABORATORIO BRONCOPULMONAR	individual	\N	\N	t	2025-08-17 03:43:05.910074
119bbe47-963f-4f60-b90e-b7b02646dcff	04-01-023-01	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:43:08.69774
499f0c1b-3bfb-43eb-93fc-215ed016b331	26-06-024-00	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:43:22.87232
0c6ca4e0-4a0d-4649-aae5-8d067bae155e	13-01-030-01	URGENCIA PEDIATRIA	Servicio importado: URGENCIA PEDIATRIA	individual	\N	\N	t	2025-08-17 03:43:25.424875
d974ddc4-8ea0-4f1f-834e-ffcdbdb35eb4	04-50-018-02	CARDIO INTERV Y TERAP ENDOVASCULAR	Servicio importado: CARDIO INTERV Y TERAP ENDOVASCULAR	individual	\N	\N	t	2025-08-17 03:43:36.637893
2db0f34b-198f-4ecd-890b-d71765bdcd19	26-07-037-00	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:43:40.263767
cd28cc98-e231-459f-8bff-2ec27d7f5cef	26-06-009-02	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:43:40.670372
e405cc9d-41ce-4298-8084-ef0963712b31	26-07-025-00	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:43:46.037471
1a387c10-20fa-4729-8b5b-d4dc74fc1c09	26-08-011-00	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:43:55.570439
ee48dbb1-821b-433a-8f73-84832f51efbb	26-08-010-00	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:43:55.878636
caa1fe91-c606-44b2-af9b-1aa1488b62c1	17-07-001-01	MAIPU BRONCOPULMONAR	Servicio importado: MAIPU BRONCOPULMONAR	individual	\N	\N	t	2025-08-17 03:44:13.659262
1e9a763a-dc8c-4c75-ac79-1bf6741fe735	17-07-011-01	MAIPU BRONCOPULMONAR	Servicio importado: MAIPU BRONCOPULMONAR	individual	\N	\N	t	2025-08-17 03:44:15.535591
04d40453-f575-4383-a447-46641cec5256	26-01-024-01	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:44:17.744341
9e2e63f9-defc-4240-9971-7bee3aa563ad	26-02-045-00	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:44:18.146596
898519a2-aa63-49bb-8072-08e5e9cc4c27	04-01-024-01	RADIOLOGIA	Servicio importado: RADIOLOGIA	individual	\N	\N	t	2025-08-17 03:44:20.657637
c310140b-64f6-434f-bd2e-e1bf67198888	16-02-212-02	SALA DE PROCEDIMIENTOS TORRE A	Servicio importado: SALA DE PROCEDIMIENTOS TORRE A	individual	\N	\N	t	2025-08-17 03:44:31.71751
175e5764-477f-426b-8adc-4c07799b4623	16-01-117-01	SALA DE PROCEDIMIENTOS LOS ESPAÑOLES	Servicio importado: SALA DE PROCEDIMIENTOS LOS ESPAÑOLES	individual	\N	\N	t	2025-08-17 03:44:32.310743
a7ce6aaf-d0cc-4c90-adce-fdabd36147d8	26-02-045-03	URGENCIA ADULTO	Servicio importado: URGENCIA ADULTO	individual	\N	\N	t	2025-08-17 03:44:34.709063
260e43a1-c116-4c9c-b665-25468423ea88	16-01-115-01	PROCEDIMIENTOS GINECO OBTETRICOS	Servicio importado: PROCEDIMIENTOS GINECO OBTETRICOS	individual	\N	\N	t	2025-08-17 03:44:42.229742
1559a3ee-cd57-4fd2-a4c2-bc9ae6783404	26-08-002-00	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:44:43.988522
977db91e-707a-464d-96b6-ea5bbd2460e4	04-50-120-01	MAMOGRAFIA	Servicio importado: MAMOGRAFIA	individual	\N	\N	t	2025-08-17 03:44:48.920795
6d61f6c6-b064-4ac7-a8c4-8d5b368654b4	98-02-015-01	ECOTOMOGRAFIA GENERAL	Servicio importado: ECOTOMOGRAFIA GENERAL	individual	\N	\N	t	2025-08-17 03:44:52.083412
304df327-83cb-4c8a-91d5-748fd2ea25ab	26-03-007-00	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:44:56.256395
22866c02-469d-4586-8f82-3efbffebb65e	74-01-029-02	HOSP UPC NEONATOLOGIA 3A 	Servicio importado: HOSP UPC NEONATOLOGIA 3A 	individual	\N	\N	t	2025-08-17 03:45:11.428173
c1c0af1b-d28a-4ea5-893c-ddde465bbbaf	20-01-005-02	SALA DE PROCEDIMIENTOS TORRE A	Servicio importado: SALA DE PROCEDIMIENTOS TORRE A	individual	\N	\N	t	2025-08-17 03:45:24.364618
4451c01c-ccaf-432a-a7b5-39af9dcf5156	26-01-000-01	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:45:25.009537
2a29845e-6a01-429e-b617-1f8010442f4f	04-01-011-09	MAMOGRAFIA	Servicio importado: MAMOGRAFIA	individual	\N	\N	t	2025-08-17 03:46:00.729193
47d85c57-934c-47bf-9f02-7bae27de0708	19-01-005-02	PROCEDIMIENTOS UROLOGICOS	Servicio importado: PROCEDIMIENTOS UROLOGICOS	individual	\N	\N	t	2025-08-17 03:46:04.889047
f721d957-8db4-4c44-a94a-2bfcb92f5cb7	26-05-007-00	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:46:08.743189
a5b89355-bf75-423b-b6f8-33621a53b36c	05-01-138-01	MEDICINA NUCLEAR	Servicio importado: MEDICINA NUCLEAR	individual	\N	\N	t	2025-08-17 03:46:25.370017
553e71d6-3907-4e3b-891c-959b08111f2d	16-02-224-02	SALA DE PROCEDIMIENTOS TORRE A	Servicio importado: SALA DE PROCEDIMIENTOS TORRE A	individual	\N	\N	t	2025-08-17 03:46:52.494834
d489d5e3-a262-4a3f-92c0-896dc78f82f1	26-04-054-00	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:47:11.011626
ac5fb417-3177-4172-9126-3c82cd8bf154	16-02-232-02	SALA DE PROCEDIMIENTOS TORRE A	Servicio importado: SALA DE PROCEDIMIENTOS TORRE A	individual	\N	\N	t	2025-08-17 03:47:15.000894
b649176c-819a-4f70-bf79-105179ec6d1a	26-06-008-01	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:47:16.159287
e194edac-9aa1-4c14-b993-39f077d6876d	26-03-066-00	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:47:19.216365
2695b432-b78e-4189-84e9-39530dd54622	18-01-024-02	PROCEDIMIENTOS DE GASTROENTEROLOGIA	Servicio importado: PROCEDIMIENTOS DE GASTROENTEROLOGIA	individual	\N	\N	t	2025-08-17 03:47:35.581767
84b1e0d5-d4ab-47e2-9038-42ff9243fd22	18-01-032-02	PROCEDIMIENTOS DE GASTROENTEROLOGIA	Servicio importado: PROCEDIMIENTOS DE GASTROENTEROLOGIA	individual	\N	\N	t	2025-08-17 03:47:35.859822
164c7549-0a0b-4487-b5a2-dada18d7624c	04-05-004-01	RESONANCIA NUCLEAR MAGNETICA	Servicio importado: RESONANCIA NUCLEAR MAGNETICA	individual	\N	\N	t	2025-08-17 03:47:38.43643
2e3f1038-a4a6-4bcd-b2cb-8cefc6dd58bb	26-01-015-01	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:48:17.274756
3da41a64-cb4a-40fa-820f-88f87f685ea7	26-04-004-01	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:48:17.923232
da264c9a-eb44-4ceb-a0bd-b7491b879362	26-01-013-01	CONSULTAS 04 LE ODONTOLOGIA	Servicio importado: CONSULTAS 04 LE ODONTOLOGIA	individual	\N	\N	t	2025-08-17 03:48:30.91231
42e96186-7fe4-46e8-ba57-59094e32b80a	17-07-021-02	SALA DE PROCEDIMIENTOS TORRE A	Servicio importado: SALA DE PROCEDIMIENTOS TORRE A	individual	\N	\N	t	2025-08-17 03:48:46.945035
e7e2622c-a1a0-496c-9bf9-a4715c734858	17-01-900-10	CARDIO PROCEDIMIENTOS	Servicio importado: CARDIO PROCEDIMIENTOS	individual	\N	\N	t	2025-08-17 03:48:49.569823
9a5abd96-d8f5-44d1-a541-9441d1015712	05-01-105-91	MEDICINA NUCLEAR	Servicio importado: MEDICINA NUCLEAR	individual	\N	\N	t	2025-08-17 03:49:01.003912
f90e5862-ca77-4306-984a-7230766cc970	16-02-222-02	URGENCIA PEDIATRIA	Servicio importado: URGENCIA PEDIATRIA	individual	\N	\N	t	2025-08-17 03:49:11.088752
7c37a28e-904d-4dd8-8e67-2f050e28c29a	26-01-040-01	URGENCIA ADULTO	Servicio importado: URGENCIA ADULTO	individual	\N	\N	t	2025-08-17 03:49:12.319257
81dff6ba-7cba-43b2-ac32-df3664ee389e	26-00-020-00	RADIOLOGIA DENTAL	Servicio importado: RADIOLOGIA DENTAL	individual	\N	\N	t	2025-08-17 03:49:28.872295
\.


--
-- Data for Name: calculation_rules; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.calculation_rules (id, code, name, description, base_rule, valid_from, valid_to, participation_type, specialty_id, service_id, doctor_id, medical_center_id, agreement_type_id, insurance_type_id, society_id, schedule_type, applicable_days, payment_type, payment_value, is_active, created_at, updated_at) FROM stdin;
3ab2fd36-45a2-428d-90e8-5343e0bf9d72	REGLA I	REGLA NRO 1	REGLA DE MUESTRA PARA UNA SOCIEDAD DE PROFESIONALES		2025-08-01	2025-08-31	individual	esp001	\N	8de8a565-5933-411b-a80b-1f1e9c47c18d	\N	\N	\N	\N	regular	["monday", "wednesday", "sunday", "friday", "saturday", "thursday", "tuesday"]	percentage	75.05	t	2025-08-05 02:29:10.696707	2025-08-19 03:46:32.43
d2d73694-6bc2-4bcd-9ce2-c8bd70fb4ea4	R001	REGLA II	REGAL CREADA PARA CALCULO DE PAGO DE UN PROFESIONAL	REGLA BASA NUMERO 2	2025-03-01	2025-03-31	individual	esp001	\N	2c756808-92a4-454b-a0bb-7db066519b18	\N	\N	\N	\N	regular	["monday", "wednesday", "sunday", "friday", "saturday", "thursday", "tuesday"]	percentage	50.00	t	2025-08-05 02:32:51.959853	2025-08-19 00:51:59.888
\.


--
-- Data for Name: provider_types; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.provider_types (id, code, name, description, system_type, tramo, copago_percentage, is_active, created_at) FROM stdin;
4c4a775e-40f1-4709-8e8c-a434f20bab67	FONASA_A	FONASA Tramo A	Personas carentes de recursos	fonasa	A	0.00	t	2025-08-05 18:29:00.058931
9645c305-9ed3-4e5e-b9e9-28fbde66aa7a	FONASA_B	FONASA Tramo B	Ingresos hasta $210.001	fonasa	B	0.00	t	2025-08-05 18:29:00.058931
96fb4a7a-7040-401f-8e84-c1fcff2fa9df	FONASA_C	FONASA Tramo C	Ingresos $210.002 - $306.000	fonasa	C	0.00	t	2025-08-05 18:29:00.058931
5ed37495-fe3e-4df6-a13c-445e1ee4e013	FONASA_D	FONASA Tramo D	Ingresos sobre $306.601	fonasa	D	0.00	t	2025-08-05 18:29:00.058931
16f71b19-ec30-49a7-8bec-0266664de412	ISAPRE_BANMEDICA	Banmédica	ISAPRE Banmédica	isapre	\N	0.00	t	2025-08-05 18:29:00.058931
62166e16-1766-42fe-b02a-cfb8b3082a14	ISAPRE_COLMENA	Colmena Golden Cross	ISAPRE Colmena Golden Cross	isapre	\N	0.00	t	2025-08-05 18:29:00.058931
2f2fb1fa-eb6a-443e-aaaa-ad70cb1568e7	ISAPRE_CONSALUD	Consalud	ISAPRE Consalud	isapre	\N	0.00	t	2025-08-05 18:29:00.058931
ce1da615-24c1-49de-90dd-b6060ca069e8	ISAPRE_CRUZBLANC	Cruz Blanca	ISAPRE Cruz Blanca	isapre	\N	0.00	t	2025-08-05 18:29:00.058931
f81b0b1f-5b06-4e7c-8e8b-212c445e7344	ISAPRE_VIDATRES	Vida Tres	ISAPRE Vida Tres	isapre	\N	0.00	t	2025-08-05 18:29:00.058931
c381abd7-3ba9-4623-928a-afa2dcb43dcb	PARTICULAR	Particular	Atención particular/privada	particular	\N	0.00	t	2025-08-05 18:29:00.058931
\.


--
-- Data for Name: medical_attentions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.medical_attentions (id, patient_rut, patient_name, doctor_id, service_id, provider_type_id, medical_center_id, attention_date, attention_time, schedule_type, gross_amount, net_amount, participated_amount, status, created_at, updated_at, record_type, participation_percentage, service_name, provider_name, medical_society_id, medical_society_name, medical_society_rut, doctor_internal_code, specialty_id, payee_rut, payee_name, professional_rut, commission, external_id) FROM stdin;
0bbe74b9-0d64-4acf-a4c2-30d023d242cb	77162060-4	SOC. DE PROF. ANDUEZA Y GONZALEZ LTDA.	c8941b14-2e68-4399-b480-145f173b90d9	bf20c1ca-1cf6-4a2d-9624-47f863d3a915	ce1da615-24c1-49de-90dd-b6060ca069e8	\N	2025-08-07	09:00	regular	52800.00	52800.00	52800.00	paid	2025-08-19 03:00:29.77677	2025-08-19 03:07:00.839774	participacion	7	SALA DE PROCEDIMIENTOS TORRE A	CRUZ BLANCA	\N	\N	\N	\N	\N	\N	\N	6095009-1	0	51271267
6c735b39-6a44-421c-92d2-f5930f2f1928	77162060-4	SOC. DE PROF. ANDUEZA Y GONZALEZ LTDA.	c8941b14-2e68-4399-b480-145f173b90d9	1be97f14-fb37-4762-8919-8af2d8920761	c381abd7-3ba9-4623-928a-afa2dcb43dcb	\N	2025-08-07	09:00	regular	31860.00	31860.00	31860.00	paid	2025-08-19 03:00:28.837232	2025-08-19 03:07:00.839774	participacion	7	PROCEDIMIENTOS GINECO OBTETRICOS	PARTICULAR	\N	\N	\N	\N	\N	\N	\N	6095009-1	0	51266921
9f3ab931-51f8-46ec-b963-769ca66867d8	77162060-4	SOC. DE PROF. ANDUEZA Y GONZALEZ LTDA.	c8941b14-2e68-4399-b480-145f173b90d9	bf20c1ca-1cf6-4a2d-9624-47f863d3a915	62166e16-1766-42fe-b02a-cfb8b3082a14	\N	2025-08-07	09:00	regular	52800.00	52800.00	52800.00	paid	2025-08-19 03:00:28.99586	2025-08-19 03:07:00.839774	participacion	7	SALA DE PROCEDIMIENTOS TORRE A	COLMENA	\N	\N	\N	\N	\N	\N	\N	6095009-1	0	51269524
66e17470-6761-4d47-84a4-fb7c889e410b	77162060-4	SOC. DE PROF. ANDUEZA Y GONZALEZ LTDA.	c8941b14-2e68-4399-b480-145f173b90d9	977f6041-702e-43c1-a71e-74ece9406dd3	62166e16-1766-42fe-b02a-cfb8b3082a14	\N	2025-08-07	09:00	regular	28140.00	28140.00	28140.00	paid	2025-08-19 03:00:29.151849	2025-08-19 03:07:00.839774	participacion	7	SALA DE PROCEDIMIENTOS TORRE A	COLMENA	\N	\N	\N	\N	\N	\N	\N	6095009-1	0	51269525
075af39a-83f8-4c06-bfd3-a6883b4696a8	6796408-K	AVAYU HIRNHEIMER ESTER IDA	8de8a565-5933-411b-a80b-1f1e9c47c18d	236d0303-1c2e-487b-bd07-a26033107132	ce1da615-24c1-49de-90dd-b6060ca069e8	\N	2025-08-07	09:00	regular	52530.00	52530.00	44913.00	calculated	2025-08-19 03:45:47.940775	2025-08-19 03:47:25.486	participacion	7	SALA DE PROCEDIMIENTOS LOS ESPAÑOLES	CRUZ BLANCA	\N	\N	\N	\N	\N	\N	\N	6796408-K	0	51271301
1f890e8a-88d7-4b92-80a6-a70d887fe37f	77162060-4	SOC. DE PROF. ANDUEZA Y GONZALEZ LTDA.	c8941b14-2e68-4399-b480-145f173b90d9	bf20c1ca-1cf6-4a2d-9624-47f863d3a915	62166e16-1766-42fe-b02a-cfb8b3082a14	\N	2025-08-07	09:00	regular	52800.00	52800.00	52800.00	paid	2025-08-19 03:00:29.465343	2025-08-19 03:07:00.839774	participacion	7	SALA DE PROCEDIMIENTOS TORRE A	COLMENA	\N	\N	\N	\N	\N	\N	\N	6095009-1	0	51269527
edb42d18-49ff-444d-9b89-04ae9ad0a907	77162060-4	SOC. DE PROF. ANDUEZA Y GONZALEZ LTDA.	c8941b14-2e68-4399-b480-145f173b90d9	977f6041-702e-43c1-a71e-74ece9406dd3	ce1da615-24c1-49de-90dd-b6060ca069e8	\N	2025-08-07	09:00	regular	28140.00	28140.00	28140.00	paid	2025-08-19 03:00:29.619465	2025-08-19 03:07:00.839774	participacion	7	SALA DE PROCEDIMIENTOS TORRE A	CRUZ BLANCA	\N	\N	\N	\N	\N	\N	\N	6095009-1	0	51271266
cadf47ba-c913-4561-8f6d-bbea2f5a6175	6796408-K	AVAYU HIRNHEIMER ESTER IDA	8de8a565-5933-411b-a80b-1f1e9c47c18d	236d0303-1c2e-487b-bd07-a26033107132	c381abd7-3ba9-4623-928a-afa2dcb43dcb	\N	2025-08-07	09:00	regular	52530.00	52530.00	44913.00	calculated	2025-08-19 03:45:47.223173	2025-08-19 03:47:25.571	participacion	7	SALA DE PROCEDIMIENTOS LOS ESPAÑOLES	PARTICULAR	\N	\N	\N	\N	\N	\N	\N	6796408-K	0	51266975
51fc55d3-c0f6-4163-996d-9375c063f212	6796408-K	AVAYU HIRNHEIMER ESTER IDA	8de8a565-5933-411b-a80b-1f1e9c47c18d	b723b77a-3fb4-4a32-b72c-36eaddebc0a4	16f71b19-ec30-49a7-8bec-0266664de412	\N	2025-08-07	09:00	regular	19695.00	19695.00	16839.00	calculated	2025-08-19 03:45:47.405477	2025-08-19 03:47:25.647	participacion	7	SALA DE PROCEDIMIENTOS TORRE A	BANMEDICA	\N	\N	\N	\N	\N	\N	\N	6796408-K	0	51268206
748e5357-2a18-4e72-a815-e7e517447948	6796408-K	AVAYU HIRNHEIMER ESTER IDA	8de8a565-5933-411b-a80b-1f1e9c47c18d	76641e70-ae14-499d-8b2c-39f860196487	16f71b19-ec30-49a7-8bec-0266664de412	\N	2025-08-07	09:00	regular	196945.00	196945.00	168388.00	calculated	2025-08-19 03:45:47.591971	2025-08-19 03:47:25.724	participacion	7	SALA DE PROCEDIMIENTOS TORRE A	BANMEDICA	\N	\N	\N	\N	\N	\N	\N	6796408-K	0	51268207
ad400bbe-5090-43e0-85dc-e7dea8a73daa	6796408-K	AVAYU HIRNHEIMER ESTER IDA	8de8a565-5933-411b-a80b-1f1e9c47c18d	236d0303-1c2e-487b-bd07-a26033107132	16f71b19-ec30-49a7-8bec-0266664de412	\N	2025-08-07	09:00	regular	54750.00	54750.00	46811.00	calculated	2025-08-19 03:45:47.772842	2025-08-19 03:47:25.808	participacion	7	SALA DE PROCEDIMIENTOS LOS ESPAÑOLES	BANMEDICA	\N	\N	\N	\N	\N	\N	\N	6796408-K	0	51268208
\.


--
-- Data for Name: payment_calculations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.payment_calculations (id, attention_id, calculation_rule_id, doctor_id, base_amount, rule_type, rule_value, calculated_amount, calculation_date, period_month, period_year, status, created_at) FROM stdin;
a234a72b-6fca-40cf-9c44-87d6a7c5b945	0bbe74b9-0d64-4acf-a4c2-30d023d242cb	3ab2fd36-45a2-428d-90e8-5343e0bf9d72	c8941b14-2e68-4399-b480-145f173b90d9	52800.00	percentage	100.00	52800.00	2025-08-19 03:08:03.102731	8	2025	processed	2025-08-19 03:08:03.102731
7ea4c7b0-d801-413e-b6f7-a87297100449	6c735b39-6a44-421c-92d2-f5930f2f1928	3ab2fd36-45a2-428d-90e8-5343e0bf9d72	c8941b14-2e68-4399-b480-145f173b90d9	31860.00	percentage	100.00	31860.00	2025-08-19 03:08:03.102731	8	2025	processed	2025-08-19 03:08:03.102731
f9644b52-66f2-47ae-94fc-37b65300716a	9f3ab931-51f8-46ec-b963-769ca66867d8	3ab2fd36-45a2-428d-90e8-5343e0bf9d72	c8941b14-2e68-4399-b480-145f173b90d9	52800.00	percentage	100.00	52800.00	2025-08-19 03:08:03.102731	8	2025	processed	2025-08-19 03:08:03.102731
e03f6927-6d80-4994-a214-bc008f9b5493	66e17470-6761-4d47-84a4-fb7c889e410b	3ab2fd36-45a2-428d-90e8-5343e0bf9d72	c8941b14-2e68-4399-b480-145f173b90d9	28140.00	percentage	100.00	28140.00	2025-08-19 03:08:03.102731	8	2025	processed	2025-08-19 03:08:03.102731
9d573549-2d75-4efa-9d48-9e6e2c0ce283	1f890e8a-88d7-4b92-80a6-a70d887fe37f	3ab2fd36-45a2-428d-90e8-5343e0bf9d72	c8941b14-2e68-4399-b480-145f173b90d9	52800.00	percentage	100.00	52800.00	2025-08-19 03:08:03.102731	8	2025	processed	2025-08-19 03:08:03.102731
6f861f20-8854-4e5e-8324-d5b81fece029	edb42d18-49ff-444d-9b89-04ae9ad0a907	3ab2fd36-45a2-428d-90e8-5343e0bf9d72	c8941b14-2e68-4399-b480-145f173b90d9	28140.00	percentage	100.00	28140.00	2025-08-19 03:08:03.102731	8	2025	processed	2025-08-19 03:08:03.102731
ef8c0cc7-52a3-4bc9-ad24-eda197fc19f5	075af39a-83f8-4c06-bfd3-a6883b4696a8	3ab2fd36-45a2-428d-90e8-5343e0bf9d72	8de8a565-5933-411b-a80b-1f1e9c47c18d	44913.00	percentage	75.05	33707.21	2025-08-19 03:47:25.460131	8	2025	calculated	2025-08-19 03:47:25.460131
b5cd4449-e8c8-4058-b66a-4c6dd322e28d	cadf47ba-c913-4561-8f6d-bbea2f5a6175	3ab2fd36-45a2-428d-90e8-5343e0bf9d72	8de8a565-5933-411b-a80b-1f1e9c47c18d	44913.00	percentage	75.05	33707.21	2025-08-19 03:47:25.544189	8	2025	calculated	2025-08-19 03:47:25.544189
b403c0d8-fd82-4c8c-824a-a25a8abd9451	51fc55d3-c0f6-4163-996d-9375c063f212	3ab2fd36-45a2-428d-90e8-5343e0bf9d72	8de8a565-5933-411b-a80b-1f1e9c47c18d	16839.00	percentage	75.05	12637.67	2025-08-19 03:47:25.628928	8	2025	calculated	2025-08-19 03:47:25.628928
f0d0e5e2-9354-42de-afa1-08be66b7eb62	748e5357-2a18-4e72-a815-e7e517447948	3ab2fd36-45a2-428d-90e8-5343e0bf9d72	8de8a565-5933-411b-a80b-1f1e9c47c18d	168388.00	percentage	75.05	126375.19	2025-08-19 03:47:25.704958	8	2025	calculated	2025-08-19 03:47:25.704958
c9ab16f7-63a3-4572-b7b8-4ca3a378dcdb	ad400bbe-5090-43e0-85dc-e7dea8a73daa	3ab2fd36-45a2-428d-90e8-5343e0bf9d72	8de8a565-5933-411b-a80b-1f1e9c47c18d	46811.00	percentage	75.05	35131.66	2025-08-19 03:47:25.788781	8	2025	calculated	2025-08-19 03:47:25.788781
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.payments (id, doctor_id, period_month, period_year, total_amount, total_attentions, payment_method, bank_account, bank_name, account_holder_name, account_holder_rut, status, payment_date, processed_at, transaction_reference, batch_number, created_at, updated_at, total_brut_amount, payee_rut, payee_name) FROM stdin;
23822ffd-33f6-4965-bb0d-d05ff4e83009	093d559a-c031-4bdc-838e-ba894ae6e686	8	2025	592449.00	28	transfer	\N	\N	\N	\N	paid	2025-08-18	2025-08-18 21:55:54.766	\N	\N	2025-08-18 21:55:54.786169	2025-08-18 21:55:54.786169	\N	\N	\N
ebb052a5-ccfc-4628-8f97-5cb9ab5f7fcc	093d559a-c031-4bdc-838e-ba894ae6e686	2	2025	232488.00	22	transfer	\N	\N	\N	\N	paid	2025-08-18	2025-08-18 22:50:12.749	\N	\N	2025-08-18 22:50:12.771051	2025-08-18 22:50:12.771051	464976.00	\N	\N
204d981d-a38d-4913-b623-2e8ac38f7456	093d559a-c031-4bdc-838e-ba894ae6e686	3	2025	533204.00	28	transfer	\N	\N	\N	\N	processed	\N	\N	\N	\N	2025-08-19 01:01:44.213118	2025-08-19 01:01:44.213118	592449.00	13292030-3	MARILEO ZAGAL ROBERTO 
fd26b005-f357-45f8-9847-7be92534da80	093d559a-c031-4bdc-838e-ba894ae6e686	4	2025	55000.00	2	transfer	\N	\N	\N	\N	processed	\N	\N	\N	\N	2025-08-19 01:05:14.646107	2025-08-19 01:05:14.646107	55000.00	13292030-3	MARILEO ZAGAL ROBERTO 
cf4064db-a680-4643-abe7-03401e7963ed	c8941b14-2e68-4399-b480-145f173b90d9	8	2025	274680.00	7	\N	\N	\N	\N	\N	paid	2025-08-19	\N	\N	\N	2025-08-19 03:07:35.717776	2025-08-19 03:07:35.717776	\N	\N	\N
\.


--
-- Data for Name: service_tariffs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.service_tariffs (id, service_id, provider_type_id, gross_amount, net_amount, participated_amount, valid_from, valid_to, is_active, created_at) FROM stdin;
6b8956ca-f0a6-45ca-bcd1-82c2485b5890	srv001	4c4a775e-40f1-4709-8e8c-a434f20bab67	15000.00	12600.00	12600.00	2025-01-01	\N	t	2025-08-05 18:29:21.377221
886e351d-a070-42c1-b924-054cf0ab194e	srv001	9645c305-9ed3-4e5e-b9e9-28fbde66aa7a	15000.00	12600.00	12600.00	2025-01-01	\N	t	2025-08-05 18:29:21.377221
70dbd866-faf6-4046-ba6b-a3e60dab3510	srv001	96fb4a7a-7040-401f-8e84-c1fcff2fa9df	18000.00	15120.00	15120.00	2025-01-01	\N	t	2025-08-05 18:29:21.377221
6371c18e-4a8c-48d3-9852-21b2301b61ab	srv001	5ed37495-fe3e-4df6-a13c-445e1ee4e013	20000.00	16800.00	16800.00	2025-01-01	\N	t	2025-08-05 18:29:21.377221
4791bd0d-803b-4cc5-92e2-5dc890050bad	srv001	c381abd7-3ba9-4623-928a-afa2dcb43dcb	45000.00	37800.00	37800.00	2025-01-01	\N	t	2025-08-05 18:29:21.377221
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (sid, sess, expire) FROM stdin;
fbrLmOUZAsY9QtCb8wU-JBkVtiXsXACl	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-25T19:39:27.516Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604799999}, "unifiedUser": "admin_user"}	2025-08-26 12:52:43
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, first_name, last_name, profile_image_url, rut, profile, created_at, updated_at, doctor_id) FROM stdin;
43001957	sociedadcalcagno@gmail.com	Guillermo	Calcagno Vargas	\N	\N	user	2025-08-05 02:02:20.030867	2025-08-05 12:36:01.366	\N
doctor_c8941b14-2e68-4399-b480-145f173b90d9	doctor_c8941b14-2e68-4399-b480-145f173b90d9@medical.cl	ANDUEZA	GONZALEZ RICARDO 	\N	\N	doctor	2025-08-19 03:41:11.565	2025-08-19 03:41:11.565	c8941b14-2e68-4399-b480-145f173b90d9
mock_user	usuario@hospital.cl	Dra. Ana	López	\N	\N	user	2025-08-05 12:46:00.461994	2025-08-07 03:34:24.845	\N
mock_supervisor	supervisor@hospital.cl	Dr. Carlos	Rodríguez	\N	\N	supervisor	2025-08-05 13:06:44.930411	2025-08-06 01:05:38.935	\N
mock_doctor_51263437	51263437@hospital.cl	Dr.	51263437-K	\N	\N	doctor	2025-08-17 23:00:15.294075	2025-08-17 23:00:15.357	e406b03e-db40-456b-9c23-88b1ac48f669
mock_doctor_carlos	cperez@hospital.cl	Dr. Carlos Alberto	Pérez Morales	\N	\N	doctor	2025-08-07 01:13:55.192214	2025-08-17 23:47:11.743	doc003
doctor_14366756	alarcon@hospital.cl	ALARCON STUARDO	RAUL	\N	14366756-1	doctor	2025-08-17 23:54:01.706971	2025-08-17 23:54:01.706971	e357dd5e-b806-4564-aa5b-36bb382dae25
admin_user	admin@hospital.cl	Supervisor	Operacion	\N	\N	admin	2025-08-05 13:06:15.914297	2025-08-17 23:46:57.786	\N
marileo_doctor	marileozagalroberto@hospital.cl	\N	\N	\N	\N	doctor	2025-08-19 01:27:14.745021	2025-08-19 01:27:14.745021	093d559a-c031-4bdc-838e-ba894ae6e686
e357dd5e-b806-4564-aa5b-36bb382dae25	alarconstuardoraul@hospital.cl	ALARCON	STUARDO RAUL 	\N	\N	doctor	2025-08-19 01:41:14.614	2025-08-19 01:41:14.614	e357dd5e-b806-4564-aa5b-36bb382dae25
doctor_doc002	doctor_doc002@medical.cl	Dra.	María Elena Rodríguez Silva	\N	\N	doctor	2025-08-19 01:41:24.668	2025-08-19 01:41:24.668	doc002
doctor_2da0066f-a319-4410-be31-0c46a1c5327b	doctor_2da0066f-a319-4410-be31-0c46a1c5327b@medical.cl	BLAMEY	ARIAS FRANCIS ELIZABETH	\N	\N	doctor	2025-08-19 02:39:39.441	2025-08-19 02:39:39.441	2da0066f-a319-4410-be31-0c46a1c5327b
\.


--
-- PostgreSQL database dump complete
--

