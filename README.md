# README #
Setup (html side):

```
#!html

<form>
<fieldset>
	<legend>Contact</legend>
	<input type="text" name="firstName" placeholder="First Name" data-validateon="minlength textonly">
	<input type="text" name="lastName" placeholder="Last Name" data-validateon="minlength textonly">
	<input type="text" name="telephone" placeholder="Telephone" data-validateon="minlength maxlength numberonly">
	<input type="text" name="futuredate" placeholder="Enter a future date: (DD-MM-YYYY)" data-validateon="ddmmyy futuredate required">
	<input type="text" name="pastdate" placeholder="Enter a date in the past: (DD-MM-YYYY)" data-validateon="ddmmyy pastdate required">
	<textarea placeholder="Enquiry" data-validateon="minlength"></textarea>
	<button>Submit</button>
</fieldset>
</form>
```