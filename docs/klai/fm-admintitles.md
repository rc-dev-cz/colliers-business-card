# FileMaker: `admintitles` (Manage Titles)

Table `store_titles`: `id` (number), `title`, `language` (`EN` | `FR`). Layout `Titles List`.

## `BF - onFormRequest - admintitles`

```
Set Variable [ $data ; Value:
Let ( [
  ~sql = "SELECT " & SQL.GetFieldName ( store_titles::id )
       & ", " & SQL.GetFieldName ( store_titles::title )
       & ", " & SQL.GetFieldName ( store_titles::language )
       & " FROM " & SQL.GetTableName ( store_titles::title )
       & " WHERE " & SQL.GetFieldName ( store_titles::title ) & " IS NOT NULL"
       & " ORDER BY " & SQL.GetFieldName ( store_titles::title ) & " ASC" ;
  ~rows = ExecuteSQL ( ~sql ; Char ( 9 ) ; ¶ ) ;
  ~rows = If ( ~rows = "?" ; "" ; ~rows ) ;
  ~count = ValueCount ( ~rows )
] ;
  While (
    [ ~i = 0 ; ~json = "[]" ] ;
    ~i < ~count ;
    [
      ~row = Substitute ( GetValue ( ~rows ; ~i + 1 ) ; Char ( 9 ) ; ¶ ) ;
      ~json = JSONSetElement ( ~json ; ~i ;
        JSONSetElement ( "{}" ;
          [ "id" ; GetValue ( ~row ; 1 ) ; JSONNumber ] ;
          [ "title" ; GetValue ( ~row ; 2 ) ; JSONString ] ;
          [ "language" ; Upper ( GetValue ( ~row ; 3 ) ) ; JSONString ]
        ) ; JSONObject ) ;
      ~i = ~i + 1
    ] ;
    ~json
  )
) ]
Set Variable [ $$BF_Model ; Value: JSONSetElement ( $$BF_Model ; "titles" ; $data ; JSONArray ) ]
```

## `BF - onUtility - admintitles`

Klai sends only `payload` (`modelFilterKeys: ["payload"]`). A new title has an empty `id`; ids that are not numbers (`title-…`, `seed-…`) are Klai-only rows and are ignored.

```
Set Error Capture [ On ]
Set Variable [ $type ; Value: JSONGetElement ( $$BF_Hook ; "options.type" ) ]
Set Variable [ $id ; Value: JSONGetElement ( $$BF_Model ; "payload.id" ) ]
Set Variable [ $title ; Value: Trim ( JSONGetElement ( $$BF_Model ; "payload.title" ) ) ]
Set Variable [ $language ; Value: If ( Upper ( JSONGetElement ( $$BF_Model ; "payload.language" ) ) = "FR" ; "FR" ; "EN" ) ]
Set Variable [ $isRecordId ; Value: not IsEmpty ( $id ) and Filter ( $id ; "0123456789" ) = $id ]
Go to Layout [ "Titles List" (store_titles) ; Animation: None ]
#
If [ $type = "save" and not IsEmpty ( $title ) ]
	If [ IsEmpty ( $id ) ]
		# Create
		New Record/Request
		Set Field [ store_titles::title ; $title ]
		Set Field [ store_titles::language ; $language ]
		Commit Records/Requests [ Skip data entry validation ; With dialog: Off ]
		Set Variable [ $$BF_Model ; Value: JSONSetElement ( $$BF_Model ; "payload.newId" ; store_titles::id ; JSONNumber ) ]
	Else If [ $isRecordId ]
		# Update (rename)
		Enter Find Mode [ Pause: Off ]
		Set Field [ store_titles::id ; "==" & $id ]
		Perform Find []
		If [ Get ( FoundCount ) = 1 ]
			Set Field [ store_titles::title ; $title ]
			Set Field [ store_titles::language ; $language ]
			Commit Records/Requests [ Skip data entry validation ; With dialog: Off ]
		End If
	End If
End If
#
If [ $type = "delete" and $isRecordId ]
	Enter Find Mode [ Pause: Off ]
	Set Field [ store_titles::id ; "==" & $id ]
	Perform Find []
	If [ Get ( FoundCount ) = 1 ]
		Delete Record/Request [ With dialog: Off ]
	End If
End If
```
