/*

Simple work hour/payment javascript calculator
Copyright (C) 2018  Pekka Helenius

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*

KNOWN BUGS & ISSUES

<begin- bugs & issues list>

// TODO: Print output in reverse order so that the latest message is the first one (maybe this belongs to HTML part?)

// TODO: Duplicate function calls of receiveCurrentDate() in parent functions clearMessages() & writeoutputMessage(). Better implementation needed?

<end - bugs & issues list>

*/


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 1. BEGIN - CURRENT DATE
//
// Update date field by a new page (refresh page) or user input request
// Used also later in this script code

function receiveCurrentDate(current_dd, current_mm, current_year, dateint) {

    current_dd = new Date().getDate();
    current_mm = new Date().getMonth() + 1;
    current_year = new Date().getFullYear();

    if (current_dd < 10) {
        current_dd = "0" + current_dd;
    }

    if (current_mm < 10) {
        current_mm = "0" + current_mm;
    }

    dateint = current_year + current_mm + current_dd;

    return [current_dd, current_mm, current_year, dateint];

}
// 1. END - CURRENT DATE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 2. BEGIN - CLEAR OUTPUT MESSAGES
//
// Clear generated output messages
// Reset clock and date fields
// HTML output only (doesn't affect console log)

function clearMessages() {

    var cur_datefield = receiveCurrentDate();
    document.getElementById("job_day").value = cur_datefield[0] + "." + cur_datefield[1] + "." + cur_datefield[2];

    document.getElementById("clock_start").value = "00:00";
    document.getElementById("clock_end").value = "00:00";

    document.getElementById("output").innerHTML = "";
}

// 2. END - CLEAR OUTPUT MESSAGES
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 3. BEGIN - JOB TITLE
//
// Retrieve a job title from HTML document
// Convert job title to upper case by calling function convertToUpperCase()
// This function is called by onblur Event in attached HTML document
// Equals to kasitteleTehtava() function described in the instruction

function processJobTitle(jobtitle) {

    jobtitle = document.getElementById("job_title").value;

    // Leading and trailing non-alphabetical/numerical characters.
    // Better implementation? (\W and \w doesn't apply to scandinavian character set)

    var match = /^[^A-Za-z0-9_åÅäÄöÖ]+|[^A-Za-z0-9_åÅäÄöÖ]+$/g;

    // If incorrect characters used, clear the field
    if (jobtitle.match(match)) {
        jobtitle = jobtitle.replace(match, "");
    }

    // Declare new variable 'jobtitle_uppercase'.
    // Use value of 'jobtitle' as an input parameter for convertToUpperCase() function
    // Call convertToUpperCase() function
    var jobtitle_uppercase = convertToUpperCase(jobtitle);

    // Replace old job title value with a a converted one in HTML document
    document.getElementById("job_title").value = jobtitle_uppercase;

    return jobtitle_uppercase; // Return uppercase title

}

// 3. END - JOB TITLE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 4. BEGIN - JOB TITLE TO UPPERCASE
//
// Equals to kaikkiSuurella(merkkijono) function described in the instruction
// Is not created as a child function to processJobTitle() because it may not be as described in the instruction

function convertToUpperCase(jobstring) {

    // Convert received string to uppercase with toUpperCase() method
    // Remove leading and trailing whitespaces with trim() method
    jobstring = jobstring.toUpperCase().trim();

    return jobstring; // Returns jobstring
}

// 4. END - JOB TITLE TO UPPERCASE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 5. BEGIN - WRITE OUTPUT MESSAGE
//
// This function is triggered by user
// This function handles input & output messages processing
// Contains many child functions (tree structure)
// Triggered by "Save" button in attached HTML file

function writeoutputMessage() {

////////////////////////////////////////////////////////
// 5.1. VARIOUS MESSAGE PARTS

    var cur_datefield = receiveCurrentDate(); // Yes, we declare it here and in clearMessages() function TODO
    var errorindex = new Array(14).fill(0); // New array size of 14 for error messages
    var worktime = workingTime(); // Work time function
    var getday = whichDay(); // Day parser function
    var outputparts = outputMsgParts(); // Combine output messages generated by child functions

    // 1. Retrieve variables
    outputparts; // Must be called before generateOutput() function to get variable values

    // 2. Generate output using checked variables
    generateOutput();

////////////////////////////////////////////////////////
// 5.2. BEGIN - HTML OUTPUT MESSAGE
//
// This function generates HTML output message

    function generateOutput() {

        var outputmsg;
        var error_output = ""; // error output must be empty at this stage

////////////////////////////
// 5.2.1. ERROR CHECK
//
// This part processes all console error messages
// Get all index values of errorindex array and write them as an single output error string

        // Check for each errorindex array value
        for (var i = 0; i < errorindex.length; i++) {

            // Convert current errorindex value to string value for .match() method
            errorindex[i] = "" + errorindex[i];

            // If an errorindex value does not match 0
            // All errorindex values are 0 if there were no any error matches
            // If we check just value 0, any string containing 0 may pass this check
            //
            if (errorindex[i].match(/^[a-zA-Z]+/)) {

                // Write syntax: <all previous error strings> + <current erroneous string> + <newline>...
                error_output = error_output + errorindex[i] + "\n"
            }
        }

////////////////////////////
// 5.2.2. VALID OUTPUT
//
// This is the output if no errors were found

        // Output if no errors
        if (error_output == "") {

            // Output message:
            // 1st line: Job title in uppercase, start-time - end-time, date (work day as a string)
            // 2nd line: Total working hours
            // 3rd line: Payment per hour
            // 4th line: Total payment of the work
            // 5th line: Job description (details)
            // 6th line: Separator
            //
            outputmsg = "<p>" + outputparts[0] + "<br><br>\n"
            + "Total work hours " + getday[3] + " " + worktime[3] + ".\n"
            + "<br>Work price per hour is " + outputparts[1] + " € on " + getday[0] + ".\n"
            + "<br>Work total price is " + outputparts[2] + " €.\n"
            + "<br><br>Description:<br>" + outputparts[3] + "\n"
            + "<br>----------------------------</p>";

////////////////////////////
// 5.2.2. INVALID OUTPUT
//
// This is the output if errors were found

        // Output if errors
        } else {

            // Error output
            // Replace all new line symbols with <br> tags (globally in this scope)
            outputmsg = "<p>ERROR:<br>" + error_output.replace(/\n/g,"<br>") + "<br>----------------------------</p>"

        }

        // Get the previous value + add new value
        document.getElementById("output").innerHTML += outputmsg;

        // Throw all found error messages into console if error_output is not ""
        if (error_output != "") {
            throw new Error("\n" + error_output); // Stop javascript code execution here
        }

    }

//-------------
// ERROR MESSAGE STRINGS
//
// Error message definitions are as follows:
/*

    errorindex[0] = Length of date string is incorrect
    errorindex[1] = Input date string is in incorrect format
    errorindex[2] = Accepted day value range is 1-31. User input value is 'input_dd'
    errorindex[3] = Accepted month value range is 1-12. User input value is 'input_mm'
    errorindex[4] = Input date value can't exceed the current day
    errorindex[5] = Input date is too far away in the past. Minimum limit is 'minimumdate'
    errorindex[6] = Length of clock start time input is incorrect
    errorindex[7] = Length of clock end time input is incorrect
    errorindex[8] = Hour value of start clock input string is not in range 0-23
    errorindex[9] = Hour value of end clock input string is not in range 0-23
    errorindex[10] = Minute value of start clock input string is not in range 0-59 (value is 'clock_min')
    errorindex[11] = Minute value of end clock input string is not in range 0-59 (value is 'clock_min')
    errorindex[12] = Erroneous start clock input value (value is 'clock')
    errorindex[13] = Erroneous end clock input value (value is 'clock')
    errorindex[14] = Starting time is greater than or equal to ending time

*/
// 5.2. END - HTML OUTPUT MESSAGE
////////////////////////////////////////////////////////
// 5.3. BEGIN - OUTPUT MESSAGE PARTS
//
// Variables defined in this part retrieve their values from child functions

    function outputMsgParts() {
//-------------
// 5.3.1. JOB TITLE

        // Generate uppercase job title with clock + day times in brackets

        var job = processJobTitle() + "<br>clock " + worktime[0] + " - " + worktime[1] + ", " + getday[2] + " (" + getday[0] + ")";

//-------------
// 5.3.2. PAYMENT-BY-DAY

        // Get payment-by-day value (72 or 48 euros)

        var payment_by_day = getday[1].toFixed(2).replace(".",",");

//-------------
// 5.3.3. TOTAL PAYMENT

        // Calculate total payment

        var totalpayment = (worktime[2] * getday[1]).toFixed(2).replace(".",",");

//-------------
// 5.3.4. JOB DESCRIPTION

        // Parse line breaks for output as described here:
        // https://stackoverflow.com/questions/863779/javascript-how-to-add-line-breaks-to-an-html-textarea
        //
        var description = document.getElementById("description").value.replace(/\r?\n/g, '<br />');

        // If "Kuvaus" text area is empty write the following string as output
        if (description == "") {
            description = "No description";
        }

//-------------

        // Return of outputMsgParts() function
        return [job, payment_by_day, totalpayment, description];

    }

// 5.3. END - OUTPUT MESSAGE PARTS
////////////////////////////////////////////////////////
// 5.4. BEGIN - DAY STRING
//
    function whichDay() {

        // Set new variable for parseDayString() function
        var parseday = parseDayString();

///////////////////////////////
// 5.4.1. WORK DAY DEFINITION
//
// Retrieve needed values from parseday variable (function parseDayString())
// Define work day as a human-readable string
// Define work day as an index value

        // Returns day-based index value
        var datevalue = new Date(parseday[0]).getDay();

        // Define day-based index value strings
        var weekday = new Array(7);
            weekday[0] = "Sunday";
            weekday[1] = "Monday";
            weekday[2] = "Tuesday";
            weekday[3] = "Wednesday";
            weekday[4] = "Thursday";
            weekday[5] = "Friday";
            weekday[6] = "Saturday";

        // Workday human-readable string
        var workday = weekday[datevalue];

///////////////////////////////
// 5.4.2. PAYMENT MULTIPLIER
//
// Define payment-per-hour multiplier according to parsed day index value

        var payment;

        // If is sunday
        if (datevalue == 0) {
            payment = 72; // Set payment multiplier

        // else it's not sunday
        } else {
            payment = 48; // Set payment multiplier
        }

///////////////////////////////
// 5.4.3. BEGIN - PARSE DAY STRING
//
// Child function for whichDay() parent function
//
// Does as follows:
//
// A) Check input day string formatting
// B) Prevent future days and limit minimum values
// C) Handle erroneous situations
//
// D 1) Return checked day, month and year values (yyyy,mm,dd)
// D 2) Return user Input Date string
// D 3) Return string which defines is it today (on tänään) or was in the past (oli)

        function parseDayString() {

            var be_str;

            // User input from HTML document
            var inputdaystr = document.getElementById("job_day").value;

            // Consider this as a string for further .substr() method
            var minimumdate = "19000101"; // Min. threshold. Day 01.01.1900

///////////////
// 5.4.3.1. CURRENT DATE VALUE
//
// Set maximum accepted date value from current day

            var currentday_int = cur_datefield[3];

///////////////
// 5.4.3.2. SPLIT INPUT DATE
//
// Length & initial format check for input date value

            // Date string must be 8-10 chars long
            if (inputdaystr.length >= 8 || inputdaystr.length <= 10) {

                // Do format checking later, just get the array values now.

                // Create a new array, size of 3, fill with zeros
                var split_date = new Array(3).fill(0);

                // Split date string into another new array. Matching pattern is , . ; or :
                // First three values
                var daysplitter = inputdaystr.split(/[,.;:]/, 3);

                // Fill split_date array with the values of splitter array
                for (var i = 0; i < daysplitter.length; i++) {
                    split_date[i] = daysplitter[i];
                }

                /* The logic and reason for above event "Create two arrays, fill the other with the values
                 * of the second one" is that if we create just a new array with split() method and user
                 * input consist of 2 values, the size of this new array would be 2. As we continue
                 * executing this javascript code, the code assumes that all 3 array indexes have been
                 * defined for split_date but that's not always the case (user error). Creating a new zero-filled
                 * array is kind of "safe buffer" here, which we rely our code on. It is safer add day values
                 * with split() method to this already existing array. Otherwise we may end up to situations
                 * where no all expected split_date array indexes have not been defined and the code may misbehave.

                About empty values:

                Null (empty) array value is not considered as an empty string but actually as 0 value in javascript comparisons by default.

                For example, without any input value (split_date[1] is NULL) the null value is treated like this:

                split_date[1] == ""; // Returns false -> null is not an empty string
                split_date[1] == 0; // Returns true -> null is number 0

                We replace empty array value (null) with an empty string in the following loop. (read: replace method works only for 'null' pattern)

                */

                // Parse all 'split_date' array indexes
                for (var j = 0; j < split_date.length; j++) {

                    // Returns NaN if contains any letters or symbols
                    parseInt(split_date[j]);

                    // Check for null, undefined, NaN etc values as explained here:
                    // https://stackoverflow.com/questions/6003884/how-do-i-check-for-null-values-in-javascript
                    //
                    if (!split_date[j]) {
                        // Based on the previous statement, replace all null values with empty strings
                        split_date[j] = split_date[j].replace(null,"");
                    }
                }

                // We may want to add "0" in cases the user input is in range 1-10.

                // Day value
                var input_dd;

                if (split_date[0] < 10 && split_date[0] > 0 && split_date[0].length != 2) {
                    input_dd = "0" + split_date[0];
                } else {
                    input_dd = split_date[0];
                }

                // Month value
                var input_mm;

                if (split_date[1] < 10 && split_date[1] > 0 && split_date[1].length != 2) {
                    input_mm = "0" + split_date[1];
                } else {
                    input_mm = split_date[1];
                }

                // Year value
                var input_year;

                // If user input is between 10-99, add prefix 20 so that output follows pattern 2012, 2035 etc.
                //
                if (split_date[2].length == 2 && split_date[2] >= 10 && split_date[2] <= 99) {
                    input_year = "20" + split_date[2];

                // Years between 2000-2009
                } else if (split_date[2].length == 1 && split_date[2] < 10) {
                    input_year = "200" + split_date[2];

                } else {
                    input_year = split_date[2];
                }

            // If length of date input string is not 8-10
            } else {

                errorindex[0] = "Length of the input date value is invalid";

            }

///////////////
// 5.4.3.2. CHECK INPUT DATE
//
// Check that input day, month and year values numbers
// Check that characters 2 and 5 are . / : ;

            switch(true) {

                // date string does not consist of 3 different array values (dd.mm.yyyy)
                case split_date.length != 3:

                //Day:
                case input_dd.length != 2: // size of the first part of the date string (day) is not 2 (dd)
                case (input_dd.match(/^[0-9]+$/) == null): // it doesn't consist only on chars 0-9

                //Month:
                case input_mm.length != 2: // size of the second part of the date string (month) is not 2 (mm)
                case (input_mm.match(/^[0-9]+$/) == null): // it doesn't consist only on chars 0-9

                //Year:
                case input_year.length != 4: //size of the third part of the date string (year) is not 4 (yyyy)
                case (input_year.match(/^[0-9]+$/) == null): // it doesn't consist only on chars 0-9

                    errorindex[1] = "Input date string (" + inputdaystr + ") is not in valid format (dd.mm.yyyy)";
                    break;

                default: // None of the cases above match

                    // Rearrange splitted date string
                    // This is considered as a typeof "string" by default so these values are just stacked together
                    // Example return value: 20150812 (yyyymmdd)
                    //
                    var inputday_int = input_year + input_mm + input_dd;

                    //Is this current day or a day in the past?
                    if (inputday_int == currentday_int) {
                        be_str = "is today";
                    } else {
                        be_str = "was";
                    }

//----------------------
// 5.4.3.2.1. CHECK RANGE OF INPUT DATE VALUES
//
// Check range of day, month and year values
// For cases 3 and 4, the date value syntax is yyyymmdd (year-month-day)
// Comparison example: 20171609 < 19000101

                    // CASE 1
                    // Input day value range is not in range 1-31
                    if (input_dd < 1 || input_dd > 31) {

                        errorindex[2] = "Accepted day value range is 1-31. Your input value is " + input_dd;

                    }

                    // CASE 2
                    // Input month value range is not in range 1-12
                    if (input_mm < 1 || input_mm > 12) {

                        errorindex[3] = "Accepted month value range is 1-12. Your input value is " + input_mm;

                    }

                    // CASE 3
                    // Input date is more than the current date
                    // Check for erroneous day and month values (only "no errors" situation accepted)
                    if (currentday_int < inputday_int && errorindex[2] == 0 && errorindex[3] == 0) {

                        errorindex[4] = "Input date value can't exceed the current day";

                    }

                    // CASE 4
                    // Input date value is less than the minimum date
                    // Convert minimumdate to integer
                    // Check for erroneous day and month values (only "no errors" situation accepted)
                    if (inputday_int < Number(minimumdate) && errorindex[2] == 0 && errorindex[3] == 0) {

                        // Here minimumdate is considered as a string again
                        errorindex[5] = "Input date is too far away in the past. Minimum limit is " + minimumdate.substr(6, 2) + "." + minimumdate.substr(4, 2) + "." + minimumdate.substr(0, 4) + ".";

                    }
            }

///////////////////////////////

            // Return for parseDayString() child function. Return date string in dd.mm.yyyy format
            return [(input_year + "," + input_mm + "," + input_dd),input_dd + "." + input_mm + "." + input_year,be_str];

        }

// 5.4.3. END - PARSE DAY STRING
//////////////////////////////

        // Return for whichDay() function
        return [workday,payment,parseday[1],parseday[2]];

    }

// 5.4. END - DAY STRING
////////////////////////////////////////////////////////
// 5.5. BEGIN - WORKING TIME
//
// Clock times (start & end)
// Syntax is hh:mm (hours:minutes)

    function workingTime() {

//////////////////////////////
// 5.5.1. VARIABLES
//
// Define global variables inside workingTime() function
// These variables can be called by any child function in workingTime() function's scope
// These variables can't be called from outside workingTime() parent function

        var clock;

        // User input values for start & end times
        var begin = document.getElementById("clock_start").value;
        var end = document.getElementById("clock_end").value;

//////////////////////////////
// 5.5.2. PARSE CLOCK STRING LENGTHS
//
// Make sure lengths of clock start & end times are correct

        // If input length is 4 AND
        // If the first character is a number AND
        // If the second char is ": . , or ;" THEN
        // add 0 prefix.
        //
        // This is usually a case if user puts a clock value like 8:43 etc.
        //
        if (begin.length == 4 && begin.charAt(0).match(/[0-9]/) && begin.charAt(1).match(/[:.,;]/)) {
            begin = "0" + begin; // typeof is "String"
        }

        if (end.length == 4 && end.charAt(0).match(/[0-9]/) && end.charAt(1).match(/[:.,;]/)) {
            end = "0" + end; // typeof is "String"
        }

        // If user types in just one number (or two), we assume these numbers mean "hours"
        //
        if (begin.length == 1 && begin.charAt(0).match(/[0-9]/)) {
            begin = "0" + begin + ":00"; // typeof is "String"

        } else if (begin.length == 2 && begin.substr(0, 2).match(/[0-9]/)) {
            begin = begin + ":00"; // typeof is "String"
        }

        if (end.length == 1 && end.charAt(0).match(/[0-9]/)) {
            end = "0" + end + ":00"; // typeof is "String"

        } else if (end.length == 2 && end.substr(0, 2).match(/[0-9]/)) {
            end = end + ":00"; // typeof is "String"
        }

//////////////////////////////
// 5.5.3. SET START & END TIMES
//
// Define correct clock values for start & end times
// Return hour and minute values for both times

//----------------------
// 5.5.3.1.
// Parse start time

        clock = begin; // Set clock variable as 'begin'
        var begintime = checkTimes(); // Define begintime variable

        // Output as follows:
        // begintime[0] = begin hour
        // begintime[1] = begin minutes
        // begintime[2] = begin time error flag

//----------------------
// 5.5.3.2.
// Parse end time

        clock = end; // Set clock variable as 'end'
        var endtime = checkTimes(); // Define endtime variable

        // Output as follows:
        // endtime[0] = end hour
        // endtime[1] = end minutes
        // endtime[2] = end time error flag

//////////////////////////////
// 5.5.4. BEGIN - START & END CLOCK TIMES FORMATTING
//
// Parse both start & end time values

        function checkTimes() {

            var clockerror = false; // Default value each time the function is called

            // INITIAL LENGTH CHECK
            // Clock input values must be 5 characters long before parsing them
            if (clock.length != 5) {

                if (clock == begin) {
                    clockerror = true;
                    errorindex[6] = "Length of the clock start time value is invalid";
                }

                if (clock == end) {
                    clockerror = true;
                    errorindex[7] = "Length of the clock end time value is invalid";
                }

            }

            // Split checked clock input value hh:mm into two parts
            //
            var clock_hour = clock.substr(0, 2); // Start from index value 0, length is 2
            var clock_min = clock.substr(3, 2); // Start from index value 3, length is 2

            var clock_separator = clock.charAt(2); // Separator character between hh:mm

            // FIRST CHECK
            // If both of splitted values contain only numbers and the symbol between them is :
            //
            if (!isNaN(clock_hour) && !isNaN(clock_min) && clock_separator.match(/[:,.;]/) ) {

                // SECOND CHECK PART 1 - HOURS
                // If the first part of clock input value is outside of range 0 and 23
                //
                if (Number(clock_hour) < 0 || Number(clock_hour) > 23) {

                    // Distinguish error messages
                    //
                    // If we use same index value for both begin & end clock times and both of them are incorrect,
                    // only the latter error would be shown in console log. This is because the previous string (error in begin value) has been overwritten by the latter one (error in end value)
                    //
                    if (clock == begin) {
                        clockerror = true;
                        errorindex[8] = "Hour value of the start clock input string is not in range 0-23 (value is " + clock_hour + ")";
                    }

                    if (clock = end) {
                        clockerror = true;
                        errorindex[9] = "Hour value of the end clock input string is not in range 0-23 (value is " + clock_hour + ")";
                    }
                }

                // SECOND CHECK PART 2 - MINUTES
                // If the second part of clock input value is outside of range 0 and 59
                //
                if (Number(clock_min) < 0 || Number(clock_min) > 59) {

                    // Distinguish error messages
                    //
                    // If we use same index value for both begin & end clock times and both of them are incorrect,
                    // only the latter error would be shown in console log. This is because the previous string (error in begin value) has been overwritten by the latter one (error in end value)
                    //
                    if (clock == begin) {
                        clockerror = true;
                        errorindex[10] = "Minute value of the start clock input string is not in range 0-59 (value is " + clock_min + ")";
                    }

                    if (clock == end) {
                        clockerror = true;
                        errorindex[11] = "Minute value of the end clock input string is not in range 0-59 (value is " + clock_min + ")";
                    }

                }

            // ELSE CONDITION FOR FIRST CHECK
            // If there is an general error in formatting of start or end clock string
            //
            } else {

                // Distinguish error messages
                //
                // If we use same index value for both begin & end clock times and both of them are incorrect,
                // only the latter error would be shown in console log. This is because the previous string (error in begin value) has been overwritten by the latter one (error in end value)
                //
                if (clock == begin) {
                    clockerror = true;
                    errorindex[12] = "Erroneous start clock value (value is " + clock + ")";
                }

                if (clock == end) {
                    clockerror = true;
                    errorindex[13] = "Erroneous end clock value (value is " + clock + ")";
                }
            }

//----------------------
            // These are return values generated by child function checkTimes()
            return [Number(clock_hour), Number(clock_min), clockerror];

        }

// 5.5.4. END - START & END CLOCK TIMES FORMATTING
//////////////////////////////
// 5.5.5. CALCULATE WORKING TIME
//
// Calculate working time from checked and parsed user input

        // If both start and end clock times are valid (don't return error)
        if (begintime[2] == false && endtime[2] == false) {

            var begin_min_total = (begintime[0] * 60) + begintime[1];
            var end_min_total = (endtime[0] * 60) + endtime[1];
            var totaltime = end_min_total - begin_min_total; // In minutes
            var totaltime_in_hours = (totaltime / 60).toFixed(2); // Force two decimals in any case for totaltime_hoursonly variable
            var totaltime_hoursonly = totaltime_in_hours.substr(0, totaltime_in_hours.indexOf("."));

            // Print this error message only if start clock time is greater than or equal to ending clock time
            //
            if (begin_min_total >= end_min_total) {

                errorindex[14] = "Starting time can't be greater than or equal to the ending time";

            }

//////////////////////////////
// 5.5.6. PARSE WORKING TIME TEXT STRING

            var totaltime_str;

            // If working time exceeds 60 minutes (hour), then we redefine how the total time should be displayed in HTML output.
            //
            if (totaltime >= 60 && (totaltime % 60 !== 0)) {
                totaltime_str = totaltime_hoursonly + " hours and " + ((totaltime_in_hours - totaltime_hoursonly) * 60).toFixed(0) + " minutes";
            } else if (totaltime < 60) {
                totaltime_str = totaltime + " minutes";
            } else if (totaltime == 60) {
                totaltime_str = totaltime_hoursonly + " hour";
            } else {
                totaltime_str = totaltime_hoursonly + " hours";
            }

        }

//////////////////////////////

        // Return values of workingTime() function
        return [begin,end,totaltime_in_hours,totaltime_str];

    }

// 5.5. END - WORKING TIME
////////////////////////////////////////////////////////

}

// 5. END - WRITE OUTPUT MESSAGE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
