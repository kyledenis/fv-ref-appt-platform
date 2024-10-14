import React, { useEffect, useState } from "react";
import { User } from "lucide-react";
import axios from "axios"

const Referee = () => {

    const [profile, setProfile] = useState({
        "referee_id": null,
        "first_name": null,
        "last_name": null,
        "gender": null,
        "date_of_birth": null,
        "age": null,
        "location": null,
        "zipcode": null,
        "email": null,
        "phone_number": null,
        "experience_years": null,
        "level": null
    })

    useEffect(() => {
        getFirstReferee()
    }, []);

    const getFirstReferee = async () => {
        const firstReferee = await axios.get("http://localhost:8000/api/referee/1/");
        if (firstReferee.status === 200) {
            setProfile(firstReferee.data);
        }
    }
    return (
        <>
        <div class="bg-white rounded shadow-lg p-4 px-4 md:p-8 mb-6">
        <div class="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3">
          <div class="text-gray-600">
            <p class="font-medium text-lg m-4">Profile Details</p>
            <div class="relative inline-block">
                <img class="w-32 h-32 rounded-full border-4 border-yellow-500 shadow-lg" src="https://static.independent.co.uk/2022/12/22/22/60b2384794158293ecb79ea1aa9ef466Y29udGVudHNlYXJjaGFwaSwxNjcxODEyMjg3-2.70328754.jpg" alt="Profile Picture" />
                <span class="absolute bottom-0 right-0 bg-green-500 rounded-full w-6 h-6 border-2 border-white" title="Online"></span>
            </div>
          </div>

          <div class="lg:col-span-2">
            <div class="grid gap-4 gap-y-3 text-sm grid-cols-1 md:grid-cols-5">
              <div class="md:col-span-5">
                <label for="full_name">Full Name</label>
                <input type="text" name="full_name" id="full_name" class="h-10 border mt-1 rounded px-4 w-full bg-gray-50" value={profile.first_name + " " + profile.last_name} />
              </div>

              <div class="md:col-span-5">
                <label for="email">Email Address</label>
                <input type="text" name="email" id="email" class="h-10 border mt-1 rounded px-4 w-full bg-gray-50" value={profile.email} placeholder="email@domain.com" />
              </div>

              <div class="md:col-span-3">
                <label for="address">Address / Street</label>
                <input type="text" name="address" id="address" class="h-10 border mt-1 rounded px-4 w-full bg-gray-50" value={profile.location} placeholder="" />
              </div>

              <div class="md:col-span-2">
                <label for="city">Postcode</label>
                <input type="text" name="city" id="city" class="h-10 border mt-1 rounded px-4 w-full bg-gray-50" value={profile.zipcode} placeholder="" />
              </div>

              <div class="md:col-span-2">
                <label for="country">Date of birth</label>
                <div class="h-10 bg-gray-50 flex border border-gray-200 rounded items-center mt-1">
                    <input type="date" id="date" name="date" class="block w-full h-10 px-4 border border-gray-300 rounded-md bg-transparent text-gray-700 focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-300" />
                </div>
              </div>

              <div class="md:col-span-2">
                <label for="gender">Gender</label>
                <div class="h-10 w-full bg-gray-50 flex border border-gray-200 rounded items-center mt-1">
                <select id="options" class="block w-full h-10 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-300">
                    <option value="" disabled selected>Select an option</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="archive">Other</option>
                </select>
                </div>
              </div>

              <div class="md:col-span-1">
                <label for="country">Age</label>
                <div class="h-10 bg-gray-50 flex border border-gray-200 rounded items-center mt-1">
                    <input type="number" id="age" name="age" class="block w-full h-10 px-4 border border-gray-300 rounded-md bg-transparent text-gray-700 focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-300" />
                </div>
              </div>

              <div class="md:col-span-1">
                <label for="country">Level</label>
                <div class="h-10 bg-gray-50 flex border border-gray-200 rounded items-center mt-1">
                    <input type="number" id="level" name="level" value={profile.level} class="block w-full h-10 px-4 border border-gray-300 rounded-md bg-transparent text-gray-700 focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-300" />
                </div>
              </div>

              <div class="md:col-span-2">
                <label for="country">Experience years</label>
                <div class="h-10 bg-gray-50 flex border border-gray-200 rounded items-center mt-1">
                    <input type="number" id="experience_years" name="experience_years" value={profile.experience_years} class="block w-full h-10 px-4 border border-gray-300 rounded-md bg-transparent text-gray-700 focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-300" />
                </div>
              </div>
      
              <div class="md:col-span-5 text-right">
                <div class="inline-flex items-end">
                  <button class="bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded">Submit</button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
        </>
    );
};
export default Referee;
